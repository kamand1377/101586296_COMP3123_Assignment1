const { body } = require('express-validator');

exports.signupRules = [
  body('username').trim().notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Letters, numbers and _ only'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format').toLowerCase(),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 64 }).withMessage('Password must be 8-64 characters')
    .matches(/[A-Z]/).withMessage('Needs an uppercase letter')
    .matches(/[a-z]/).withMessage('Needs a lowercase letter')
    .matches(/[0-9]/).withMessage('Needs a number')
];

exports.loginRules = [
  // must send username OR email, plus password
  body().custom(b => {
    if (!b.username && !b.email) throw new Error('Username or email is required');
    return true;
  }),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
];