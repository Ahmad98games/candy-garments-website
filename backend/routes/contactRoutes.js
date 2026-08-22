const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');
const { gatekeeper, CAPABILITIES } = require('../middleware/gatekeeper');

// Public routes
router.post('/', gatekeeper(CAPABILITIES.STATE_MUTATING), contactController.submitContactForm);

// Protected routes (admin only)
router.get('/', gatekeeper(CAPABILITIES.READ_ONLY), protect, admin, contactController.getContactSubmissions);
router.put('/:id', gatekeeper(CAPABILITIES.STATE_MUTATING), protect, admin, contactController.updateContactStatus);

module.exports = router; 