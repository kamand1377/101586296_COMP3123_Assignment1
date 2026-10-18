const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../services/token.service');
const logger = require('../config/logger');

module.exports = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';   // "Bearer eyJhbGciOi..."

  if (!header.startsWith('Bearer ')) {
    logger.warn('Auth failed: missing token', { path: req.originalUrl });
    throw new AppError('Authentication token missing', 401);
  }

  const token = header.split(' ')[1];               // ["Bearer", "eyJ..."] -> take index 1

  let payload;
  try {
    payload = verifyToken(token);                    // { id: "6710...", iat: ..., exp: ... }
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    logger.warn('Auth failed', { reason: err.name, path: req.originalUrl }); // reason only, never the token
    throw new AppError(expired ? 'Token expired' : 'Invalid token', 401);
  }

  const user = await User.findById(payload.id);
  if (!user) throw new AppError('User no longer exists', 401);

  req.user = { id: user._id.toString(), username: user.username }; // the ONLY trusted identity
  next();
});