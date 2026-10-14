const logger = require('../config/logger');

module.exports = (req, res, next) => {
  const start = Date.now();
   // we get the final status code
  res.on('finish', () => {
    logger.info('HTTP request', {
      method: req.method,          // GET
      path: req.originalUrl,       // /api/v1/emp/employees
      status: res.statusCode,      // 200
      durationMs: Date.now() - start,
      userId: req.user?.id         
    });
  });
  next(); // hand the request to the next checkpoint
};