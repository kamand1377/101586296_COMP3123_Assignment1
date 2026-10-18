const jwt = require('jsonwebtoken');

exports.signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);