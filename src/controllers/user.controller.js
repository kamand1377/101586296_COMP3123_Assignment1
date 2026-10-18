const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../services/token.service');
const logger = require('../config/logger');

exports.signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body; // destructuring: pulls 3 fields out of req.body

  // Friendly duplicate check (the unique index + 11000 handler is the backup)
  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) {
    const field = existing.username === username ? 'Username' : 'Email';
    throw new AppError(`${field} already exists`, 409);
  }

  const user = await User.create({ username, email, password }); // pre-save hook hashes it
  logger.info('User registered', { userId: user._id });
  res.status(201).json({ success: true, message: 'User created', user }); // toJSON drops password
});

exports.login = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const filter = username ? { username } : { email: email.toLowerCase() };

  const user = await User.findOne(filter).select('+password'); // '+' = include the hidden field this once

  // Same message for "no such user" and "wrong password" -> attackers can't learn which usernames exist
  if (!user || !(await user.comparePassword(password))) {
    logger.warn('Login failed', { identifier: username || email });
    throw new AppError('Invalid credentials', 401);
  }

  logger.info('Login success', { userId: user._id });
  res.status(200).json({ success: true, message: 'Login successful', token: signToken(user._id) });
});