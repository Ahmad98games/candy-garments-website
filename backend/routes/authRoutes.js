const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { gatekeeper, CAPABILITIES } = require('../middleware/gatekeeper');

// Public routes
router.post('/register', gatekeeper(CAPABILITIES.STATE_MUTATING), authController.register);
router.post('/login', gatekeeper(CAPABILITIES.STATE_MUTATING), authController.login);
router.post('/forgot-password', gatekeeper(CAPABILITIES.STATE_MUTATING), authController.forgotPassword);
router.post('/reset-password/:token', gatekeeper(CAPABILITIES.STATE_MUTATING), authController.resetPassword);

// Protected routes
router.get('/me', gatekeeper(CAPABILITIES.READ_ONLY), protect, authController.getMe);
router.post('/refresh', gatekeeper(CAPABILITIES.READ_ONLY), authController.refreshToken);
router.post('/logout', gatekeeper(CAPABILITIES.READ_ONLY), protect, authController.logout);

module.exports = router;
