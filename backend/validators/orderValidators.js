const { body, param } = require('express-validator');

const orderItemValidator = body('items')
  .isArray({ min: 1 })
  .withMessage('At least one order item is required');

const createOrderValidator = [
  orderItemValidator,
  body('items.*.productId').isMongoId(),
  body('items.*.quantity').isInt({ min: 1, max: 10 }),
  body('customer.name').isString().trim().isLength({ min: 2, max: 80 }),
  body('customer.email').isEmail().normalizeEmail(),
  body('customer.phone').isString().isLength({ min: 7, max: 20 }),
  body('shippingAddress.address').isString().trim().isLength({ min: 5, max: 200 }),
  body('shippingAddress.city').isString().trim().isLength({ min: 2, max: 80 }),
  body('shippingAddress.country').isString().trim().isLength({ min: 2, max: 80 }),
  body('shippingAddress.postalCode').optional().isString().isLength({ min: 3, max: 15 }),
  body('payment.method')
    .isIn(['bank_transfer', 'jazzcash', 'easypaisa', 'cod', 'paypal', 'western_union', 'wire_transfer'])
];

const orderNumberParam = param('orderNumber')
  .isString()
  .matches(/^OMN-\d{9}$/)
  .withMessage('Invalid order number format');

const updateStatusValidator = [
  orderNumberParam,
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
];

const updatePaymentValidator = [
  orderNumberParam,
  body('paymentStatus').isIn(['pending', 'completed', 'failed', 'refunded']),
  body('transactionId').optional().isString().trim().isLength({ min: 6 })
];

module.exports = {
  createOrderValidator,
  updateStatusValidator,
  updatePaymentValidator
};

