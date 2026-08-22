const express = require('express');
const router = express.Router();
const controller = require('../controllers/analyticsController');

router.post('/track', controller.track);
router.get('/events', controller.list);

module.exports = router;

