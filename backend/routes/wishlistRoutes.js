/**
 * Wishlist Routes
 */

const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/wishlistController');
const { protect, admin } = require('../middleware/authEnhanced');

// Public route for shared wishlists
router.get('/shared/:shareToken', WishlistController.getSharedWishlist);

// Protected routes
router.post('/add', protect, WishlistController.addToWishlist);
router.delete('/remove/:productId', protect, WishlistController.removeFromWishlist);
router.get('/', protect, WishlistController.getWishlist);
router.get('/check/:productId', protect, WishlistController.checkWishlist);
router.put('/:productId/priority', protect, WishlistController.updatePriority);
router.post('/share', protect, WishlistController.generateShareLink);
router.put('/:productId/notifications', protect, WishlistController.updateNotifications);
router.delete('/clear', protect, WishlistController.clearWishlist);

// Admin routes
router.get('/admin/out-of-stock/:productId', protect, admin, WishlistController.getWishlistsWithOutOfStock);
router.put('/admin/:wishlistId/mark-notification', protect, admin, WishlistController.markNotificationSent);

module.exports = router;
