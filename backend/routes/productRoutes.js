const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const { gatekeeper, CAPABILITIES } = require('../middleware/gatekeeper');
const validate = require('../middleware/validate');
const {
  paginationValidator,
  createProductValidator,
  updateProductValidator
} = require('../validators/productValidators');

router.get('/', gatekeeper(CAPABILITIES.READ_ONLY), paginationValidator, validate, productController.getProducts);
router.get('/new-arrivals', gatekeeper(CAPABILITIES.READ_ONLY), productController.getNewArrivals);
router.get('/featured', gatekeeper(CAPABILITIES.READ_ONLY), productController.getFeaturedProducts);
router.get('/search', gatekeeper(CAPABILITIES.READ_ONLY), productController.searchProducts);
router.get('/category/:category', gatekeeper(CAPABILITIES.READ_ONLY), productController.getProductsByCategory);
router.get('/:id', gatekeeper(CAPABILITIES.READ_ONLY), productController.getProductById);

router.post('/', gatekeeper(CAPABILITIES.STATE_MUTATING), protect, admin, createProductValidator, validate, productController.createProduct);
router.put('/:id', gatekeeper(CAPABILITIES.STATE_MUTATING), protect, admin, updateProductValidator, validate, productController.updateProduct);
router.delete('/:id', gatekeeper(CAPABILITIES.STATE_MUTATING), protect, admin, productController.deleteProduct);

module.exports = router;
