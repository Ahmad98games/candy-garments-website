const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Stripe routes
router.post('/stripe/create-intent', paymentController.createStripeIntent);
router.post('/stripe/verify', paymentController.verifyStripePayment);

// JazzCash routes
router.post('/jazzcash/init', paymentController.initJazzCashPayment);
router.post('/jazzcash/verify', paymentController.verifyJazzCashPayment);

// PayPal routes
router.post('/paypal/create', paymentController.createPayPalOrder);
router.post('/paypal/capture', paymentController.capturePayPalPayment);

// COD route
router.post('/cod/process', paymentController.processCODOrder);

// Public routes
router.get('/methods', paymentController.getPaymentMethods);

module.exports = router;
