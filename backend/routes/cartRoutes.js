/**
 * Cart Routes
 */

const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');

// Public cart calculation routes
router.post('/calculate', CartController.calculateTotal);
router.post('/validate-coupon', CartController.validateCoupon);
router.get('/coupons', CartController.getAvailableCoupons);
router.get('/shipping-methods', CartController.getShippingMethods);
router.post('/bulk-discount', CartController.calculateBulkDiscount);
router.post('/installments', CartController.getInstallmentOptions);
router.post('/estimate-delivery', CartController.estimateDelivery);
router.post('/summary', CartController.getCartSummary);

module.exports = router;
