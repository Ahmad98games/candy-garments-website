const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validateEnv } = require('../config/env');

const config = validateEnv();

const TOKEN_SECRET = config.jwt.approvalSecret || crypto.randomBytes(32).toString('hex');
const TOKEN_EXPIRY = '24h';

/**
 * Generate a signed JWT approval token with admin binding
 * @param {string} orderId - Order ID
 * @param {string} action - 'approve' or 'reject'
 * @param {string} adminEmail - Admin email for binding
 * @param {string} adminIp - Admin IP for additional security
 * @returns {string} Signed JWT token
 */
exports.generateApprovalToken = (orderId, action = 'approve', adminEmail = null, adminIp = null) => {
    const payload = {
        orderId: orderId.toString(),
        action,
        adminEmail: adminEmail || config.services.adminEmail,
        adminIp: adminIp || 'unknown',
        iat: Math.floor(Date.now() / 1000),
        jti: crypto.randomBytes(16).toString('hex') // Unique token ID
    };

    return jwt.sign(payload, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRY });
};

/**
 * Verify and decode approval token with strict validation
 * @param {string} token - JWT token
 * @param {string} expectedOrderId - Expected order ID for validation
 * @returns {Object|null} Decoded payload or null if invalid
 */
exports.verifyApprovalToken = (token, expectedOrderId = null) => {
    try {
        const decoded = jwt.verify(token, TOKEN_SECRET);

        // Additional validation: check if orderId matches
        if (expectedOrderId && decoded.orderId !== expectedOrderId.toString()) {
            return null;
        }

        return decoded;
    } catch (error) {
        // Token expired, invalid signature, or malformed
        return null;
    }
};

/**
 * Generate HMAC for URL verification (additional security layer)
 * @param {string} url - URL to sign
 * @returns {string} HMAC signature
 */
exports.generateUrlHmac = (url) => {
    return crypto
        .createHmac('sha256', TOKEN_SECRET)
        .update(url)
        .digest('hex')
        .substring(0, 16); // First 16 chars
};

/**
 * Verify URL HMAC
 * @param {string} url - URL to verify
 * @param {string} signature - HMAC signature
 * @returns {boolean} True if valid
 */
exports.verifyUrlHmac = (url, signature) => {
    const expected = exports.generateUrlHmac(url);
    return crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signature)
    );
};

/**
 * Generate a simple hash for backward compatibility
 * @returns {string} Random hex string
 */
exports.generateSimpleToken = () => {
    return crypto.randomBytes(16).toString('hex');
};
