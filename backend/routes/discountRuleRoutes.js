const express = require('express');
const router = express.Router();
const discountRuleController = require('../controllers/discountRuleController');

// Public active rule lookup for checkout calculations
router.get('/active', discountRuleController.getActiveRule);

// Admin CRUD
router.get('/', discountRuleController.getAllRules);
router.post('/', discountRuleController.createRule);
router.put('/', discountRuleController.updateRule);
router.delete('/:id', discountRuleController.deleteRule);

module.exports = router;
