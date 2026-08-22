const crypto = require('crypto');

/**
 * Generate order hash for tamper detection and cross-reference
 * NOTE: This is NOT for cryptographic security or payment proof
 * It's a verification aid only
 * 
 * @param {Object} orderData - Order data to hash
 * @param {string} orderData.orderId - Order ID
 * @param {number} orderData.totalAmount - Total order amount
 * @param {Array} orderData.items - Order items
 * @returns {string} - 8-character hash
 */
function generateOrderHash(orderData) {
    const { orderId, totalAmount, items } = orderData;

    // Create deterministic string from order data
    const itemsString = items
        .map(item => `${item.productId || item.product}:${item.quantity}:${item.price}`)
        .sort()
        .join('|');

    const dataString = `${orderId}:${totalAmount}:${itemsString}`;

    // Generate SHA-256 hash
    const hash = crypto
        .createHash('sha256')
        .update(dataString)
        .digest('hex');

    // Return first 8 characters
    return hash.substring(0, 8).toUpperCase();
}

/**
 * Verify order hash matches order data
 * 
 * @param {string} hash - Hash to verify
 * @param {Object} orderData - Order data
 * @returns {boolean} - True if hash matches
 */
function verifyOrderHash(hash, orderData) {
    const expectedHash = generateOrderHash(orderData);
    return hash === expectedHash;
}

module.exports = {
    generateOrderHash,
    verifyOrderHash
};
