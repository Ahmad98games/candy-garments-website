/**
 * Review Routes
 */

const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authEnhanced');

// Public routes
router.get('/product/:productId', ReviewController.getProductReviews);
router.get('/stats/:productId', ReviewController.getReviewStats);
router.get('/top/:productId', ReviewController.getTopReviews);
router.get('/user/:userId', ReviewController.getUserReviews);

// Protected routes
router.post('/', protect, ReviewController.createReview);
router.put('/:reviewId', protect, ReviewController.editReview);
router.delete('/:reviewId', protect, ReviewController.deleteReview);
router.post('/:reviewId/helpful', protect, ReviewController.markHelpful);

// Admin routes
router.get('/admin/pending', protect, admin, ReviewController.getPendingReviews);
router.put('/admin/:reviewId/moderate', protect, admin, ReviewController.moderateReview);

module.exports = router;
