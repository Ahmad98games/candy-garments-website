const express = require('express');
const router = express.Router();
const fulfillmentController = require('../controllers/fulfillmentController');

router.get('/orders', fulfillmentController.getFulfillmentOrders);
router.post('/orders/:id/video', fulfillmentController.uploadInspectionVideo);

module.exports = router;
