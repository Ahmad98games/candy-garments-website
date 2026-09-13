const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refundController');

// Customer self-serve claim submission
router.post('/request', refundController.createClaim);

// Admin queue & review
router.get('/admin', refundController.getAdminQueue);
router.post('/admin/:id/status', refundController.updateStatus);

module.exports = router;
