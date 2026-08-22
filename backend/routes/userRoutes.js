const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { gatekeeper, CAPABILITIES } = require('../middleware/gatekeeper');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  validateRegister,
  validateLogin
} = require('../validators/userValidator');

router.post('/register', gatekeeper(CAPABILITIES.STATE_MUTATING), authLimiter, validateRegister, userController.registerUser);
router.post('/login', gatekeeper(CAPABILITIES.STATE_MUTATING), authLimiter, validateLogin, userController.loginUser);
router.post('/refresh', gatekeeper(CAPABILITIES.READ_ONLY), authLimiter, userController.refreshToken);

router.post('/logout', gatekeeper(CAPABILITIES.READ_ONLY), protect, userController.logout);
router.get('/profile', gatekeeper(CAPABILITIES.READ_ONLY), protect, userController.getUserProfile);
router.put('/profile', gatekeeper(CAPABILITIES.STATE_MUTATING), protect, userController.updateUserProfile);

// Admin Routes
const { admin } = require('../middleware/auth');
router.get('/', gatekeeper(CAPABILITIES.READ_ONLY), protect, admin, userController.getAllUsers);
router.delete('/:id', gatekeeper(CAPABILITIES.STATE_MUTATING), protect, admin, userController.deleteUser);
router.put('/:id', gatekeeper(CAPABILITIES.STATE_MUTATING), protect, admin, userController.updateUserRole);

module.exports = router;