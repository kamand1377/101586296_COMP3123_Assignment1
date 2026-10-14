const express = require('express');
const app = express();          // app 

app.use(express.json());        // lets Express read JSON request bodies into req.body

app.get('/health', (req, res) => {
  // req = what the client sent, res = what we send back
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),   // seconds since the server started
    timestamp: new Date().toISOString()
  });
});

module.exports = app;           // export so server.js (and Vercel) can use it