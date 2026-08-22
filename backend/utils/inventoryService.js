const Product = require('../models/Product');
const logger = require('../services/logger');

/**
 * Calculate available stock for a product
 * @param {Object} product - Product document
 * @returns {number} - Available stock
 */
function getAvailableStock(product) {
    const stock = Number(product.stock || 0);
    const reserved = Number(product.reservedStock || 0);
    return Math.max(0, stock - reserved);
}

/**
 * Reserve stock for order items
 * @param {Array} items - Array of { product: productId, quantity: number }
 * @throws {Error} - If insufficient stock
 */
async function reserveStock(items) {
    for (const item of items) {
        const product = await Product.findById(item.product);

        if (!product) {
            throw new Error(`Product not found: ${item.product}`);
        }

        const availableStock = getAvailableStock(product);

        if (availableStock < item.quantity) {
            throw new Error(
                `Insufficient stock for ${product.name}. ` +
                `Available: ${availableStock}, Requested: ${item.quantity}`
            );
        }

        // Reserve the stock
        await Product.updateOne(
            { _id: item.product },
            { $inc: { reservedStock: item.quantity } }
        );

        logger.info('Stock reserved', {
            productId: item.product,
            productName: product.name,
            quantity: item.quantity,
            newReservedStock: product.reservedStock + item.quantity
        });
    }
}

/**
 * Decrement stock after order approval
 * @param {Array} items - Array of { product: productId, quantity: number }
 */
async function decrementStock(items) {
    for (const item of items) {
        const product = await Product.findById(item.product);

        if (!product) {
            logger.error('Product not found for stock decrement', { productId: item.product });
            continue;
        }

        // Decrement both stock and reserved stock
        await Product.updateOne(
            { _id: item.product },
            {
                $inc: {
                    stock: -item.quantity,
                    reservedStock: -item.quantity
                }
            }
        );

        logger.info('Stock decremented', {
            productId: item.product,
            productName: product.name,
            quantity: item.quantity,
            newStock: product.stock - item.quantity
        });
    }
}

/**
 * Release reserved stock (on order cancellation/rejection)
 * @param {Array} items - Array of { product: productId, quantity: number }
 */
async function releaseStock(items) {
    for (const item of items) {
        const product = await Product.findById(item.product);

        if (!product) {
            logger.error('Product not found for stock release', { productId: item.product });
            continue;
        }

        // Release the reserved stock
        await Product.updateOne(
            { _id: item.product },
            { $inc: { reservedStock: -item.quantity } }
        );

        logger.info('Stock released', {
            productId: item.product,
            productName: product.name,
            quantity: item.quantity,
            newReservedStock: product.reservedStock - item.quantity
        });
    }
}

/**
 * Check if items are in stock
 * @param {Array} items - Array of { product: productId, quantity: number }
 * @returns {Promise<{inStock: boolean, outOfStock: Array}>}
 */
async function checkStock(items) {
    const outOfStock = [];

    for (const item of items) {
        console.log(`[Inventory Check] Looking up Product ID: "${item.product}"`); // DEBUG LOG
        const product = await Product.findById(item.product);

        if (!product) {
            console.error(`[Inventory Check] FAILED: Product ID "${item.product}" not found in DB!`); // DEBUG LOG
            outOfStock.push({
                productId: item.product,
                reason: 'Product not found'
            });
            continue;
        }

        const availableStock = getAvailableStock(product);

        if (availableStock < item.quantity) {
            outOfStock.push({
                productId: item.product,
                productName: product.name,
                requested: item.quantity,
                available: availableStock
            });
        }
    }

    return {
        inStock: outOfStock.length === 0,
        outOfStock
    };
}

module.exports = {
    reserveStock,
    decrementStock,
    releaseStock,
    checkStock,
    getAvailableStock
};
