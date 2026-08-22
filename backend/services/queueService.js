const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const logger = require('./logger');
const { validateEnv } = require('../config/env');
const stateService = require('./stateService');
const { INFRA } = require('./stateService');

const config = validateEnv();

// Redis connection instance (Private to module)
let connection = null;
if (config.isProduction) {
    connection = new IORedis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        maxLoadingRetryTime: 5000,
        retryStrategy(times) {
            const delay = Math.min(times * 2000, 30000);
            return delay;
        }
    });

    // Update SystemState on connection events
    connection.on('connect', () => {
        stateService.setInfraStatus(INFRA.REDIS, true);
        logger.info('REDIS_SUCCESS: Connection established');
    });
    connection.on('error', (err) => {
        stateService.setInfraStatus(INFRA.REDIS, false);
        if (err.code === 'ECONNREFUSED') {
            if (!process._redisRefused) {
                logger.warn('REDIS_DEGRADED: Connection refused. Proceeding without queues.');
                process._redisRefused = true;
            }
        } else {
            logger.error('REDIS_FAILURE: Connection lost', { error: err.message });
        }
    });
} else {
    logger.info('DEV_MODE: Skipping Redis connection (Queues disabled)');
}

const defaultJobOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 24 * 3600, count: 1000 },
    removeOnFail: { age: 7 * 24 * 3600 }
};

// Internal Queues (Private to module)
const _queues = {};
if (connection) {
    _queues.email = new Queue('email-notifications', { connection, defaultJobOptions });
    _queues.whatsapp = new Queue('whatsapp-notifications', { connection, defaultJobOptions });
    _queues.emailDLQ = new Queue('email-dlq', { connection, defaultJobOptions });
    _queues.whatsappDLQ = new Queue('whatsapp-dlq', { connection, defaultJobOptions });
}

/**
 * .safeAdd() Pattern
 * Enforces availability check and Result object pattern.
 */
async function safeAdd(queueName, type, data, options = {}) {
    const isAvailable = stateService.getSnapshot().infra.redis;

    if (!isAvailable) {
        logger.warn('QUEUE_DEGRADED: Redis unavailable, skipping queue operation', { queueName, type });
        return { success: false, error: 'Redis unavailable - running in degraded mode' };
    }

    const queue = _queues[queueName];
    if (!queue) throw new Error(`INVALID_QUEUE: '${queueName}' does not exist.`);

    try {
        const job = await queue.add(type, {
            ...data,
            queuedAt: new Date()
        }, options);

        return { success: true, jobId: job.id };
    } catch (error) {
        logger.error('QUEUE_FAILURE: Enqueue failed', { error: error.message, queueName });
        return { success: false, error: error.message };
    }
}

/**
 * Legacy Wrappers (Refactored to use safeAdd)
 */
async function queueEmail(type, data) {
    return safeAdd('email', type, data, {
        priority: data.priority || 5,
        jobId: `email-${type}-${data.orderId || Date.now()}`
    });
}

async function queueWhatsApp(phone, templateName, params, metadata = {}) {
    return safeAdd('whatsapp', 'send-template', {
        phone, templateName, params, metadata
    }, {
        priority: metadata.priority || 5,
        jobId: `whatsapp-${templateName}-${metadata.orderId || Date.now()}`
    });
}

/**
 * Queue Monitoring (Using internal private queues)
 */
async function getQueueStats(queueName) {
    const queue = _queues[queueName];
    if (!queue) return null;

    const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount()
    ]);

    return { queue: queueName, waiting, active, completed, failed };
}

async function closeQueues() {
    logger.info('Shutting down queues...');
    try {
        await Promise.all(Object.values(_queues).map(q => q.close().catch(() => { })));
        if (connection.status !== 'end') {
            await connection.quit().catch(() => { });
        }
    } catch (err) {
        logger.warn('QUEUE: Error during cleanup', { error: err.message });
    }
}

module.exports = {
    safeAdd,
    queueEmail,
    queueWhatsApp,
    getQueueStats,
    closeQueues,
    isAvailable: () => stateService.getSnapshot().infra.redis,
    connection // Exported for authorized worker use
};
