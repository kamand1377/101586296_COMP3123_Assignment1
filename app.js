const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');                                       
const AppError = require('./src/utils/AppError');
const errorHandler = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');          

const app = express();

app.use(helmet());                                  
app.set('trust proxy', 1);                          
app.use(express.json({ limit: '10kb' }));           
app.use(require('./src/middleware/requestLogger'));

app.get('/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({
    status: dbUp ? 'ok' : 'degraded',
    database: dbUp ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});


app.use('/api', apiLimiter);
// (later: user and employee routes go HERE)
app.use('/api/v1/user', require('./src/routes/user.routes'));
app.use('/api/v1/emp', require('./src/routes/employee.routes'));

// NEW: nothing above matched this URL -> 404
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// NEW: the complaints desk, ALWAYS last
app.use(errorHandler);

module.exports = app;