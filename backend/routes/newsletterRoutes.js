const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { protect, admin } = require('../middleware/auth');
const { gatekeeper, CAPABILITIES } = require('../middleware/gatekeeper');

// Public routes
router.post('/subscribe', gatekeeper(CAPABILITIES.STATE_MUTATING), newsletterController.subscribeNewsletter);
router.post('/unsubscribe', gatekeeper(CAPABILITIES.STATE_MUTATING), newsletterController.unsubscribeNewsletter);

// Protected routes (admin only)
router.get('/', gatekeeper(CAPABILITIES.READ_ONLY), protect, admin, newsletterController.getAllSubscribers);

module.exports = router; 