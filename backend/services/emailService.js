const sgMail = require('@sendgrid/mail');
const logger = require('./logger');
const { validateEnv } = require('../config/env');

const config = validateEnv();
const { sendgrid, adminEmail } = config.services;

// Set SendGrid API key from validated config
if (sendgrid.apiKey) {
  sgMail.setApiKey(sendgrid.apiKey);
} else {
  logger.warn('SENDGRID_API_KEY not set. Email functionality will be disabled.');
}

const FROM_EMAIL = sendgrid.fromEmail;
const ADMIN_EMAIL = adminEmail;

/**
 * Send email using SendGrid
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {Array} attachments - Optional attachments
 */
const sendEmail = async (to, subject, html, attachments = []) => {
  if (!sendgrid.apiKey) {
    logger.warn('Email not sent - SENDGRID_API_KEY not configured');
    return;
  }

  try {
    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      html,
      attachments: attachments.map(att => ({
        content: att.content,
        filename: att.filename,
        type: att.type || 'application/octet-stream',
        disposition: 'attachment'
      }))
    };

    await sgMail.send(msg);
    logger.info('Email sent successfully', { to, subject });
  } catch (error) {
    logger.error('Failed to send email', {
      error: error.message,
      to,
      subject,
      response: error.response?.body
    });
    throw error;
  }
};

/**
 * Send order confirmation email to customer
 */
const sendOrderConfirmation = async (order) => {
  const email = order.guestCustomer?.email || order.user?.email;
  if (!email) {
    logger.warn('No email found for order confirmation', { orderId: order._id });
    return;
  }

  const itemsList = order.items.map(item =>
    `<li>${item.name} x${item.quantity} - PKR ${(item.price * item.quantity).toLocaleString()}</li>`
  ).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        ul { list-style: none; padding: 0; }
        li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; color: #667eea; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <p>Thank you for your purchase!</p>
        </div>
        <div class="content">
          <p>Hi ${order.guestCustomer?.name || 'Valued Customer'},</p>
          <p>We've received your order and will process it shortly.</p>
          
          <div class="order-details">
            <h2>Order #${order.orderNumber}</h2>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
            
            <h3>Items Ordered:</h3>
            <ul>${itemsList}</ul>
            
            <p class="total">Total: PKR ${order.totalAmount.toLocaleString()}</p>
            
            <h3>Shipping Address:</h3>
            <p>
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state || ''} ${order.shippingAddress.postalCode || ''}<br>
              ${order.shippingAddress.country}
            </p>
          </div>
          
          <p>We'll send you another email when your order ships.</p>
          <p>If you have any questions, please contact us at ${FROM_EMAIL}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Omnora. All rights reserved.</p>
          <p>Operated and Developed By Ahmad Mahboob</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, `Order Confirmation - ${order.orderNumber}`, html);
};

const sendApprovalRequest = async (order, receiptPath, approvalLink) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff6b6b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .btn { background: #4CAF50; color: white; padding: 14px 28px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: bold; }
        .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Payment Approval Needed</h1>
        </div>
        <div class="content">
          <p>A new order requires payment approval:</p>
          
          <div class="order-info">
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Customer:</strong> ${order.guestCustomer?.email || order.user?.email || 'N/A'}</p>
            <p><strong>Total Amount:</strong> PKR ${order.totalAmount.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${approvalLink}" class="btn">Approve Order</a>
          </p>
          
          <p style="font-size: 12px; color: #666;">
            This link will expire in 24 hours. The payment receipt is attached to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendEmail(ADMIN_EMAIL, `Payment Approval Needed - Order ${order.orderNumber}`, html);
};

const sendOrderApproved = async (order) => {
  const email = order.guestCustomer?.email || order.user?.email;
  if (!email) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Payment Approved!</h1></div>
        <div class="content">
          <p>Great news! Your payment for Order <strong>${order.orderNumber}</strong> has been approved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendEmail(email, `Payment Approved - Order ${order.orderNumber}`, html);
};

const sendAdminNewOrderNotification = async (order, approveLink, rejectLink) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      <h1>New Order Pending Approval</h1>
      <p>Order ${order.orderNumber} requires action.</p>
    </body>
    </html>
  `;
  await sendEmail(ADMIN_EMAIL, `Action Required: New Order ${order.orderNumber}`, html);
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendApprovalRequest,
  sendOrderApproved,
  sendAdminNewOrderNotification
};