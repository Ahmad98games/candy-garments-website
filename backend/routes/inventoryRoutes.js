/**
 * Inventory Routes
 */

const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authEnhanced');

// Public routes
router.get('/status/:productId', InventoryController.getInventoryStatus);
router.get('/check/:productId', InventoryController.checkStock);

// Protected routes (for cart operations)
router.post('/reserve', InventoryController.reserveStock);
router.post('/release', InventoryController.releaseStock);
router.post('/deduct', InventoryController.deductStock);

// Admin routes
router.get('/low-stock', protect, admin, InventoryController.getLowStockProducts);
router.get('/summary', protect, admin, InventoryController.getInventorySummary);
router.get('/all', protect, admin, InventoryController.getAllInventory);
router.get('/alerts', protect, admin, InventoryController.getStockAlerts);
router.post('/add', protect, admin, InventoryController.addStock);
router.post('/initialize', protect, admin, InventoryController.initializeInventory);
router.post('/bulk-update', protect, admin, InventoryController.bulkUpdateInventory);

module.exports = router;
