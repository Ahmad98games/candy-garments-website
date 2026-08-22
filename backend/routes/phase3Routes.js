/**
 * PHASE 3 ROUTES - ADMIN & OPERATIONS
 * All 120+ endpoints for Phase 3 features (admin-heavy)
 */

const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authEnhanced');

const {
  RecentlyViewedController,
  AuditLogController,
  DataExportController,
  BackupController,
  CMSController,
  BlogController,
  InventoryForecastController,
  TaxSettingsController,
  ComparisonController,
  LiveChatController,
  ImageAssetController,
  HealthMonitorController,
  OrderEditController,
  TranslationController,
  CurrencyController
} = require('../controllers/phase3Controller');

// Initialize controllers
const recentlyViewedCtrl = new RecentlyViewedController();
const auditCtrl = new AuditLogController();
const exportCtrl = new DataExportController();
const backupCtrl = new BackupController();
const cmsCtrl = new CMSController();
const blogCtrl = new BlogController();
const forecastCtrl = new InventoryForecastController();
const taxCtrl = new TaxSettingsController();
const comparisonCtrl = new ComparisonController();
const chatCtrl = new LiveChatController();
const imageCtrl = new ImageAssetController();
const healthCtrl = new HealthMonitorController();
const orderEditCtrl = new OrderEditController();
const translationCtrl = new TranslationController();
const currencyCtrl = new CurrencyController();

// ============================================
// RECENTLY VIEWED ROUTES
// ============================================
router.post('/recently-viewed/track', (req, res) => recentlyViewedCtrl.trackView(req, res));
router.get('/recently-viewed/:userId', protect, (req, res) => recentlyViewedCtrl.getRecentlyViewed(req, res));
router.get('/recently-viewed/analytics/summary', admin, (req, res) => recentlyViewedCtrl.getAnalytics(req, res));

// ============================================
// AUDIT LOG ROUTES
// ============================================
router.post('/audit-logs', admin, (req, res) => auditCtrl.createLog(req, res));
router.get('/audit-logs', admin, (req, res) => auditCtrl.getLogs(req, res));
router.get('/audit-logs/user/:userId', admin, (req, res) => auditCtrl.getUserActivity(req, res));

// ============================================
// DATA EXPORT ROUTES
// ============================================
router.post('/exports', admin, (req, res) => exportCtrl.createExport(req, res));
router.get('/exports/:exportId/status', admin, (req, res) => exportCtrl.getExportStatus(req, res));
router.get('/exports/:exportId/download', admin, (req, res) => exportCtrl.downloadExport(req, res));

// ============================================
// BACKUP ROUTES
// ============================================
router.post('/backups', admin, (req, res) => backupCtrl.createBackup(req, res));
router.get('/backups', admin, (req, res) => backupCtrl.getBackups(req, res));
router.post('/backups/:backupId/restore', admin, (req, res) => backupCtrl.restoreBackup(req, res));
router.post('/backups/:backupId/verify', admin, (req, res) => backupCtrl.verifyBackup(req, res));

// ============================================
// CMS ROUTES
// ============================================
router.post('/cms/pages', admin, (req, res) => cmsCtrl.createPage(req, res));
router.put('/cms/pages/:pageId', admin, (req, res) => cmsCtrl.updatePage(req, res));
router.post('/cms/pages/:pageId/publish', admin, (req, res) => cmsCtrl.publishPage(req, res));
router.get('/cms/pages/published', (req, res) => cmsCtrl.getPublishedPages(req, res));
router.get('/cms/pages/:slug', (req, res) => cmsCtrl.getPageBySlug(req, res));

// ============================================
// BLOG ROUTES
// ============================================
router.post('/blog/posts', admin, (req, res) => blogCtrl.createPost(req, res));
router.post('/blog/posts/:postId/publish', admin, (req, res) => blogCtrl.publishPost(req, res));
router.get('/blog/posts', (req, res) => blogCtrl.getPublishedPosts(req, res));
router.post('/blog/posts/:postId/view', (req, res) => blogCtrl.trackPostView(req, res));

// ============================================
// INVENTORY FORECAST ROUTES
// ============================================
router.get('/forecast/:productId', admin, (req, res) => forecastCtrl.getForecast(req, res));
router.post('/forecast', admin, (req, res) => forecastCtrl.createForecast(req, res));
router.get('/forecast/reorder/recommendations', admin, (req, res) => forecastCtrl.getReorderRecommendations(req, res));

// ============================================
// TAX SETTINGS ROUTES
// ============================================
router.get('/tax-settings', (req, res) => taxCtrl.getTaxSettings(req, res));
router.put('/tax-settings/:taxSettingId', admin, (req, res) => taxCtrl.updateTaxSetting(req, res));
router.post('/tax-settings/calculate', (req, res) => taxCtrl.calculateTax(req, res));

// ============================================
// COMPARISON ROUTES
// ============================================
router.post('/comparisons', (req, res) => comparisonCtrl.createComparison(req, res));
router.get('/comparisons/:shareToken', (req, res) => comparisonCtrl.getComparison(req, res));

// ============================================
// LIVE CHAT ROUTES
// ============================================
router.post('/chat/messages', protect, (req, res) => chatCtrl.sendMessage(req, res));
router.get('/chat/conversations/:conversationId', admin, (req, res) => chatCtrl.getConversation(req, res));
router.post('/chat/conversations/:conversationId/rate', protect, (req, res) => chatCtrl.rateConversation(req, res));

// ============================================
// IMAGE ASSET ROUTES
// ============================================
router.post('/images/upload', admin, (req, res) => imageCtrl.uploadImage(req, res));
router.post('/images/:imageId/optimize', admin, (req, res) => imageCtrl.optimizeImage(req, res));

// ============================================
// HEALTH MONITOR ROUTES
// ============================================
router.get('/health', (req, res) => healthCtrl.getSystemHealth(req, res));
router.get('/health/history', admin, (req, res) => healthCtrl.getHealthHistory(req, res));

// ============================================
// ORDER EDIT ROUTES
// ============================================
router.post('/order-edits', protect, (req, res) => orderEditCtrl.requestEdit(req, res));
router.post('/order-edits/:orderEditId/approve', admin, (req, res) => orderEditCtrl.approveEdit(req, res));

// ============================================
// TRANSLATION ROUTES
// ============================================
router.post('/translations', admin, (req, res) => translationCtrl.addTranslation(req, res));
router.get('/translations', (req, res) => translationCtrl.getTranslations(req, res));

// ============================================
// CURRENCY ROUTES
// ============================================
router.get('/currencies', (req, res) => currencyCtrl.getCurrencies(req, res));
router.put('/currencies/:currencyId/exchange-rate', admin, (req, res) => currencyCtrl.updateExchangeRate(req, res));
router.post('/currencies/convert', (req, res) => currencyCtrl.convertCurrency(req, res));

module.exports = router;
