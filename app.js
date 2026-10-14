const express = require('express');
const mongoose = require('mongoose');   // is the DB connected?

const app = express();

app.use(express.json());
app.use(require('./src/middleware/requestLogger'));
app.get('/health', (req, res) => {
  // Mongoose keeps a number for the connection state:
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbUp = mongoose.connection.readyState === 1;   // true or false

  res.status(dbUp ? 200 : 503).json({        // 200 if DB is fine, 503 "service unavailable" if not
    status: dbUp ? 'ok' : 'degraded',
    database: dbUp ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = app;