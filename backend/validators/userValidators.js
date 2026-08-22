const { body } = require('express-validator');

const passwordRules = () =>
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character');

const registerValidator = [
  body('firstName').isString().trim().isLength({ min: 2, max: 50 }),
  body('lastName').isString().trim().isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail(),
  passwordRules(),
  body('phone').optional().isString().isLength({ min: 7, max: 20 })
];

const loginValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const profileUpdateValidator = [
  body('firstName').optional().isString().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().isString().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().isString().isLength({ min: 7, max: 20 }),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character')
];

const refreshValidator = [
  body('refreshToken').isString().notEmpty()
];

module.exports = {
  registerValidator,
  loginValidator,
  profileUpdateValidator,
  refreshValidator
};

