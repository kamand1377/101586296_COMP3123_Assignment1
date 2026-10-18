const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const onLimit = (req, res, next, options) => {
  logger.warn('Rate limit exceeded', { ip: req.ip, path: req.originalUrl });
  res.status(429).json({ success: false, message: 'Too many requests, please try again later', errors: [] });
};

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,                 // 5 attempts per IP per window
  standardHeaders: 'draft-7', // sends RateLimit headers so clients see remaining attempts
  legacyHeaders: false,
  handler: onLimit
});

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: onLimit
});