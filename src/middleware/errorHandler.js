const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Malformed JSON body, e.g. {"name": } -> express.json() throws this
  if (err.type === 'entity.parse.failed') { status = 400; message = 'Malformed JSON body'; }

  // MongoDB duplicate key (unique username/email already taken)
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue)[0];   // e.g. "email"
    message = `${field} already exists`;
  }

  // Bad ObjectId that slipped past validation
  if (err.name === 'CastError') { status = 400; message = 'Invalid ID format'; }

  // Mongoose schema validation failure
  if (err.name === 'ValidationError') {
    status = 400; message = 'Validation failed';
    errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
  }

  // Never leak internals for unexpected errors
  if (status === 500) {
    logger.error('Unhandled error', { message: err.message, stack: err.stack, path: req.originalUrl });
    message = 'Internal server error';
  } else {
    logger.warn('Request failed', { status, message, path: req.originalUrl });
  }

  res.status(status).json({ success: false, message, errors });
};