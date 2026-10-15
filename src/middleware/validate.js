const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

module.exports = (req, res, next) => {
  const result = validationResult(req);          // collects problems the rules recorded
  if (result.isEmpty()) return next();           // no problems -> continue down the hallway

  const errors = result.array().map(e => ({ field: e.path, message: e.msg }));
  logger.warn('Validation failed', { path: req.originalUrl, fields: errors.map(e => e.field) });
  next(new AppError('Validation failed', 400, errors)); // to the complaints desk
};