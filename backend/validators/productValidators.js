const { body, query, param } = require('express-validator');

const paginationValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('isFeatured').optional(),
  query('isNew').optional()
];

const requiredProductFields = () => [
  body('name').isString().trim().isLength({ min: 2, max: 120 }),
  body('price').isFloat({ min: 0 }),
  body('description').isString().trim().isLength({ min: 10, max: 2000 }),
  body('image').isString().trim(),
  body('category').isString().trim().isLength({ min: 2, max: 80 }),
  body('isNew').optional().isBoolean(),
  body('isFeatured').optional().isBoolean()
];

const optionalProductFields = () =>
  requiredProductFields().map(rule => rule.optional({ nullable: true }));

const createProductValidator = requiredProductFields();

const updateProductValidator = [
  param('id').notEmpty().isString(), // Changed from isMongoId() to support "1", "2" etc.
  ...optionalProductFields()
];

module.exports = {
  paginationValidator,
  createProductValidator,
  updateProductValidator
};

