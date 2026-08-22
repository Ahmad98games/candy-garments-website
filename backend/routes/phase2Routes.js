/**
 * PHASE 2 ROUTES - CUSTOMER LOYALTY & PERSONALIZATION
 * All 80+ endpoints for Phase 2 features
 */

const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authEnhanced');

const {
  CustomerSegmentationController,
  LoyaltyPointsController,
  ReferralProgramController,
  WarrantyController,
  FraudDetectionController,
  ShippingCalculatorController,
  CustomerAddressController,
  GuestCheckoutController,
  AIProductDescriptionController
} = require('../controllers/phase2Controller');

// Initialize controllers
const segmentCtrl = new CustomerSegmentationController();
const loyaltyCtrl = new LoyaltyPointsController();
const referralCtrl = new ReferralProgramController();
const warrantyCtrl = new WarrantyController();
const fraudCtrl = new FraudDetectionController();
const shippingCtrl = new ShippingCalculatorController();
const addressCtrl = new CustomerAddressController();
const guestCtrl = new GuestCheckoutController();
const aiCtrl = new AIProductDescriptionController();

// ============================================
// CUSTOMER SEGMENTATION ROUTES
// ============================================
router.get('/segmentation/:userId', protect, (req, res) => segmentCtrl.getSegments(req, res));
router.post('/segmentation/:userId/recalculate', protect, admin, (req, res) => segmentCtrl.recalculateSegments(req, res));
router.get('/segmentation/analysis/bulk', admin, (req, res) => segmentCtrl.bulkSegmentAnalysis(req, res));

// ============================================
// LOYALTY POINTS ROUTES
// ============================================
router.post('/loyalty/earn', protect, (req, res) => loyaltyCtrl.earnPoints(req, res));
router.post('/loyalty/redeem', protect, (req, res) => loyaltyCtrl.redeemPoints(req, res));
router.get('/loyalty/balance/:userId', protect, (req, res) => loyaltyCtrl.getBalance(req, res));
router.get('/loyalty/history/:userId', protect, (req, res) => loyaltyCtrl.getHistory(req, res));

// ============================================
// REFERRAL PROGRAM ROUTES
// ============================================
router.post('/referral/generate-code', protect, (req, res) => referralCtrl.generateReferralCode(req, res));
router.post('/referral/apply-code', (req, res) => referralCtrl.applyReferralCode(req, res));
router.get('/referral/earnings/:userId', protect, (req, res) => referralCtrl.trackEarnings(req, res));
router.get('/referral/codes/:userId', protect, (req, res) => referralCtrl.getMyReferralCodes(req, res));

// ============================================
// WARRANTY ROUTES
// ============================================
router.get('/warranty/available', (req, res) => warrantyCtrl.getAvailableWarranties(req, res));
router.post('/warranty/add-to-order', protect, (req, res) => warrantyCtrl.addWarrantyToOrder(req, res));
router.post('/warranty/file-claim', protect, (req, res) => warrantyCtrl.fileWarrantyClaim(req, res));
router.get('/warranty/claims/:userId', protect, (req, res) => warrantyCtrl.getWarrantyClaims(req, res));

// ============================================
// FRAUD DETECTION ROUTES
// ============================================
router.post('/fraud/flag-order', protect, admin, (req, res) => fraudCtrl.flagOrder(req, res));
router.get('/fraud/review-queue', admin, (req, res) => fraudCtrl.getReviewQueue(req, res));
router.put('/fraud/approve/:fraudFlagId', admin, (req, res) => fraudCtrl.approveOrder(req, res));
router.put('/fraud/reject/:fraudFlagId', admin, (req, res) => fraudCtrl.rejectOrder(req, res));

// ============================================
// SHIPPING CALCULATOR ROUTES
// ============================================
router.post('/shipping/calculate', (req, res) => shippingCtrl.calculateShippingCost(req, res));
router.get('/shipping/rates', (req, res) => shippingCtrl.getShippingRates(req, res));
router.put('/shipping/rates/:rateId', admin, (req, res) => shippingCtrl.updateShippingRate(req, res));

// ============================================
// CUSTOMER ADDRESS ROUTES
// ============================================
router.post('/addresses/:userId', protect, (req, res) => addressCtrl.addAddress(req, res));
router.get('/addresses/:userId', protect, (req, res) => addressCtrl.getAddresses(req, res));
router.put('/addresses/:userId/:addressId/default', protect, (req, res) => addressCtrl.setDefaultAddress(req, res));
router.put('/addresses/:addressId', protect, (req, res) => addressCtrl.updateAddress(req, res));
router.delete('/addresses/:addressId', protect, (req, res) => addressCtrl.deleteAddress(req, res));

// ============================================
// GUEST CHECKOUT ROUTES
// ============================================
router.post('/guest/checkout', (req, res) => guestCtrl.createGuestCheckout(req, res));
router.get('/guest/order/:guestToken', (req, res) => guestCtrl.getGuestOrder(req, res));
router.post('/guest/convert-to-account', (req, res) => guestCtrl.convertToAccount(req, res));

// ============================================
// AI PRODUCT DESCRIPTION ROUTES
// ============================================
router.post('/ai-description/generate', admin, (req, res) => aiCtrl.generateDescription(req, res));
router.post('/ai-description/select', admin, (req, res) => aiCtrl.selectDescription(req, res));
router.get('/ai-description/:productId', (req, res) => aiCtrl.getDescriptionVersions(req, res));
router.post('/ai-description/:aiDescriptionId/track', (req, res) => aiCtrl.trackAnalytics(req, res));

module.exports = router;
