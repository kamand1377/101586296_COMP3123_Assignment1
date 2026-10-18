const { createLogger, format, transports } = require('winston');
const fs = require('fs');

// Vercel sets VERCEL automatically; its disk is read-only, so no log files there
const onVercel = !!process.env.VERCEL;

// Locally: make sure the logs folder exists
if (!onVercel && !fs.existsSync('logs')) fs.mkdirSync('logs');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),            // always: terminal locally, Logs tab on Vercel
    ...(onVercel ? [] : [                // only locally: write files
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/app.log' })
    ])
  ]
});

module.exports = logger;