/**
 * Search Routes
 */

const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/searchController');
const { protect, admin } = require('../middleware/authEnhanced');

// Public routes
router.get('/', SearchController.searchProducts);
router.get('/suggestions', SearchController.getSuggestions);
router.get('/filter-options', SearchController.getFilterOptions);
router.get('/popular', SearchController.getPopularSearches);
router.get('/metadata', SearchController.getSearchMetadata);

// Admin routes
router.get('/admin/analytics', protect, admin, SearchController.getSearchAnalytics);

module.exports = router;
