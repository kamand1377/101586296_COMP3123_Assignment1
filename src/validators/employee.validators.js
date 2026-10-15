const { body, param, query } = require('express-validator');

// ---------- POST /employees: every field is required ----------
exports.createEmployeeRules = [
  body('first_name').trim().notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name max 50 characters'),

  body('last_name').trim().notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name max 50 characters'),

  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format').toLowerCase(),

  body('position').trim().notEmpty().withMessage('Position is required')
    .isLength({ min: 2, max: 100 }).withMessage('Position must be 2-100 characters'),

  body('salary').notEmpty().withMessage('Salary is required')
    .isFloat({ gt: 0 }).withMessage('Salary must be a positive number').toFloat(),

  body('date_of_joining').notEmpty().withMessage('Date of joining is required')
    .isISO8601().withMessage('Date must be YYYY-MM-DD').toDate(),

  body('department').trim().notEmpty().withMessage('Department is required')
    .isLength({ min: 2, max: 100 }).withMessage('Department must be 2-100 characters')
];

// ---------- PUT /employees/:eid: same checks, but every field is optional ----------
exports.updateEmployeeRules = [
  body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty')
    .isLength({ max: 50 }).withMessage('First name max 50 characters'),

  body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty')
    .isLength({ max: 50 }).withMessage('Last name max 50 characters'),

  body('email').optional().trim()
    .isEmail().withMessage('Invalid email format').toLowerCase(),

  body('position').optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage('Position must be 2-100 characters'),

  body('salary').optional()
    .isFloat({ gt: 0 }).withMessage('Salary must be a positive number').toFloat(),

  body('date_of_joining').optional()
    .isISO8601().withMessage('Date must be YYYY-MM-DD').toDate(),

  body('department').optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage('Department must be 2-100 characters')
];

// ---------- IDs ----------
// GET / PUT use /employees/:eid  -> the id is in the URL path
exports.eidParamRule = [
  param('eid').isMongoId().withMessage('Invalid employee ID')
];

// DELETE uses /employees?eid=... -> the id is in the query string
exports.eidQueryRule = [
  query('eid').notEmpty().withMessage('Employee ID is required')
    .isMongoId().withMessage('Invalid employee ID')
];