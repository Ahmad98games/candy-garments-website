/**
 * Recommendation Routes
 */

const express = require('express');
const router = express.Router();
const RecommendationController = require('../controllers/recommendationController');
const { protect, admin, optionalAuth } = require('../middleware/authEnhanced');

// Public routes
router.get('/similar/:productId', RecommendationController.getSimilarProducts);
router.get('/frequently-bought/:productId', RecommendationController.getFrequentlyBoughtTogether);
router.get('/trending', RecommendationController.getTrendingProducts);
router.get('/seasonal', RecommendationController.getSeasonalRecommendations);

// Protected routes
router.get('/personalized', protect, RecommendationController.getPersonalizedRecommendations);
router.post('/view-tracking', optionalAuth, RecommendationController.trackProductView);
router.post('/track-purchase', RecommendationController.trackPurchase);

// Admin routes
router.get('/admin/stats', protect, admin, RecommendationController.getRecommendationStats);

module.exports = router;
