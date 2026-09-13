const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const trustController = require('../controllers/trustController');

// Rate limiting for OTP request: 5 requests per 10 minutes per IP
const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: 'Too many OTP requests from this connection. Please wait a few minutes.' },
});

// Rate limiting for OTP verify: 10 attempts per 10 minutes per IP
const verifyRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { error: 'Too many verification attempts. Please try again later.' },
});

router.post('/request-otp', otpRateLimiter, trustController.requestOtp);
router.post('/verify-otp', verifyRateLimiter, trustController.verifyOtp);
router.get('/customer-status', trustController.getCustomerStatus);

module.exports = router;
