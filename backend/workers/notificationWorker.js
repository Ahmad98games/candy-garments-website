const { Worker } = require('bullmq');
const { emailDLQ, whatsappDLQ, connection } = require('../services/queueService');
const MessageLog = require('../models/MessageLog');
const { validateEnv } = require('../config/env');

const config = validateEnv();

// Redis connection is now shared from queueService.js to adhere to architectural invariants

// ============================================
// EMAIL WORKER
// ============================================

const emailWorker = new Worker('email-notifications', async (job) => {
    const { type, orderId, ...data } = job.data;

    logger.info('Processing email job', { jobId: job.id, type, orderId });

    try {
        const emailService = require('../services/emailService');

        // Try SendGrid first
        try {
            switch (type) {
                case 'order_confirmation':
                    await emailService.sendOrderConfirmation(data.order);
                    break;
                case 'payment_approved':
                    await emailService.sendOrderApproved(data.order);
                    break;
                case 'admin_new_order':
                    await emailService.sendAdminNewOrderNotification(data.order, data.approveLink, data.rejectLink);
                    break;
                case 'approval_request':
                    await emailService.sendApprovalRequest(data.order, data.receiptPath, data.approvalLink);
                    break;
                default:
                    throw new Error(`Unknown email type: ${type}`);
            }

            logger.info('Email sent successfully', { jobId: job.id, type });
            return { success: true, provider: 'sendgrid' };

        } catch (sendgridError) {
            // If SendGrid fails with 5xx, try SMTP fallback
            if (sendgridError.code >= 500) {
                logger.warn('SendGrid failed, trying SMTP fallback', { error: sendgridError.message });
                throw sendgridError; // For now, throw to trigger retry
            }
            throw sendgridError;
        }

    } catch (error) {
        logger.error('Email job failed', {
            jobId: job.id,
            type,
            error: error.message,
            attemptsMade: job.attemptsMade
        });

        // If max attempts reached, push to DLQ
        if (job.attemptsMade >= 3) {
            await emailDLQ.add('failed-email', {
                ...job.data,
                failedReason: error.message,
                failedAt: new Date(),
                originalJobId: job.id
            });
            logger.warn('Email job moved to DLQ', { jobId: job.id, type });
        }

        throw error; // Re-throw to trigger retry
    }
}, {
    connection,
    concurrency: 5,
    limiter: {
        max: 10,
        duration: 1000
    }
});

// ============================================
// WHATSAPP WORKER
// ============================================

const whatsappWorker = new Worker('whatsapp-notifications', async (job) => {
    const { phone, templateName, params, metadata } = job.data;

    logger.info('Processing WhatsApp job', {
        jobId: job.id,
        templateName,
        phone: phone.substring(0, 5) + '***'
    });

    try {
        const whatsappService = require('../utils/whatsappService');

        const response = await whatsappService.sendTemplateMessage(phone, templateName, "en_US", params);

        if (response && response.error) {
            throw new Error(response.message || 'WhatsApp API error');
        }

        if (response && response.messages && response.messages[0]) {
            const messageId = response.messages[0].id;

            await MessageLog.create({
                messageId,
                recipientPhone: phone,
                type: 'template',
                direction: 'outbound',
                status: 'sent',
                content: { templateName, params, orderId: metadata.orderId }
            });

            logger.info('WhatsApp sent and logged', {
                jobId: job.id,
                messageId,
                templateName
            });

            return { success: true, messageId };
        }

        throw new Error('No message ID in response');

    } catch (error) {
        logger.error('WhatsApp job failed', {
            jobId: job.id,
            templateName,
            error: error.message,
            attemptsMade: job.attemptsMade
        });

        if (job.attemptsMade >= 3) {
            await whatsappDLQ.add('failed-whatsapp', {
                ...job.data,
                failedReason: error.message,
                failedAt: new Date(),
                originalJobId: job.id
            });
            logger.warn('WhatsApp job moved to DLQ', { jobId: job.id, templateName });
        }

        throw error;
    }
}, {
    connection,
    concurrency: 3,
    limiter: {
        max: 5,
        duration: 1000
    }
});

// ============================================
// WORKER EVENT HANDLERS
// ============================================

emailWorker.on('completed', (job) => {
    logger.info('Email job completed', { jobId: job.id });
});

emailWorker.on('failed', (job, err) => {
    logger.error('Email job failed permanently', {
        jobId: job?.id,
        error: err.message
    });
});

whatsappWorker.on('completed', (job) => {
    logger.info('WhatsApp job completed', { jobId: job.id });
});

whatsappWorker.on('failed', (job, err) => {
    logger.error('WhatsApp job failed permanently', {
        jobId: job?.id,
        error: err.message
    });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

async function shutdown() {
    logger.info('Shutting down workers...');
    await Promise.all([
        emailWorker.close(),
        whatsappWorker.close()
    ]);
    logger.info('Workers shut down successfully');
    process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

logger.info('Notification workers started', {
    emailConcurrency: 5,
    whatsappConcurrency: 3
});

module.exports = {
    emailWorker,
    whatsappWorker,
    shutdown
};
