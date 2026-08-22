/**
 * Phase 1 Routes
 * Checkout & Cart Features
 * - One-Click Checkout
 * - Abandoned Cart Recovery
 * - Smart Bundles
 * - Product Variants
 * - Flash Sales
 * - Back-In-Stock Alerts
 * - Order Tracking
 */

const express = require('express');
const router = express.Router();
const {
  setupOneClickCheckout,
  getOneClickCheckout,
  addPaymentMethod,
  removePaymentMethod,
  performOneClickCheckout,
  setDefaultPaymentMethod,
  trackCartAbandon,
  recoverCart,
  getAbandonedCarts,
  sendRecoveryEmail,
  sendBulkRecoveryEmails,
  createBundle,
  getBundleRecommendations,
  getTopBundles,
  autoGenerateBundles,
  trackBundleView,
  getProductVariants,
  updateVariantStock,
  getActiveFlashSales,
  trackFlashSaleImpression,
  getOrderTracking,
  updateOrderStatus,
  subscribeBackInStockAlert,
  getMyAlerts,
  unsubscribeAlert,
} = require('../controllers/phase1Controller');

const { protect, admin } = require('../middleware/authEnhanced');

// ============================================
// ONE-CLICK CHECKOUT ROUTES
// ============================================

// Protected routes
router.post('/checkout/setup', protect, setupOneClickCheckout);
router.get('/checkout/get', protect, getOneClickCheckout);
router.post('/checkout/add-payment', protect, addPaymentMethod);
router.delete('/checkout/remove-payment/:paymentMethodId', protect, removePaymentMethod);
router.post('/checkout/set-default-payment', protect, setDefaultPaymentMethod);
router.post('/checkout/one-click', protect, performOneClickCheckout);

// ============================================
// ABANDONED CART RECOVERY ROUTES
// ============================================

// Public routes
router.post('/cart/track-abandon', trackCartAbandon);
router.get('/cart/recover/:recoveryToken', recoverCart);

// Protected routes
router.post('/cart/send-recovery-email', protect, sendRecoveryEmail);

// Admin routes
router.get('/admin/abandoned-carts', admin, getAbandonedCarts);
router.post('/admin/send-bulk-recovery', admin, sendBulkRecoveryEmails);

// ============================================
// SMART BUNDLES ROUTES
// ============================================

// Public routes
router.get('/bundles/active', getActiveFlashSales);
router.get('/bundles/top', getTopBundles);
router.get('/bundles/recommendations/:productId', getBundleRecommendations);
router.post('/bundles/track-view/:bundleId', trackBundleView);

// Admin routes
router.post('/admin/bundles/create', admin, createBundle);
router.post('/admin/bundles/auto-generate', admin, autoGenerateBundles);

// ============================================
// PRODUCT VARIANTS ROUTES
// ============================================

// Public routes
router.get('/products/:productId/variants', getProductVariants);

// Admin routes
router.put('/admin/variants/:variantId/stock', admin, updateVariantStock);

// ============================================
// FLASH SALES ROUTES
// ============================================

// Public routes
router.get('/flash-sales/active', getActiveFlashSales);
router.post('/flash-sales/:flashSaleId/track', trackFlashSaleImpression);

// ============================================
// BACK-IN-STOCK ALERTS ROUTES
// ============================================

// Protected routes
router.post('/alerts/back-in-stock/subscribe', protect, subscribeBackInStockAlert);
router.get('/alerts/my-alerts', protect, getMyAlerts);
router.delete('/alerts/:alertId/unsubscribe', protect, unsubscribeAlert);

// ============================================
// ADVANCED ORDER TRACKING ROUTES
// ============================================

// Public routes
router.get('/orders/:orderId/tracking', getOrderTracking);

// Admin routes
router.put('/admin/orders/:orderId/tracking', admin, updateOrderStatus);

module.exports = router;
