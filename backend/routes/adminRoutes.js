const express = require('express');
const router = express.Router();
const {
    getQueueStats,
    getDLQJobs,
    retryDLQJob,
    deleteDLQJob,
    getAdminLogs,
    getMessageLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Queue monitoring
router.get('/queue/stats', getQueueStats);

// DLQ management
router.get('/dlq', getDLQJobs);
router.post('/dlq/:jobId/retry', retryDLQJob);
router.delete('/dlq/:jobId', deleteDLQJob);

// Audit logs
router.get('/logs', getAdminLogs);

// Message tracking
router.get('/messages', getMessageLogs);

module.exports = router;
