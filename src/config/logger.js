const { createLogger, format, transports } = require('winston');
const fs = require('fs');

if (!fs.existsSync('logs')) fs.mkdirSync('logs'); // make the folder if missing

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),   // adds timestamp
    format.json()         // each log line is one JSON object
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // errors only
    new transports.File({ filename: 'logs/app.log' }),                    // everything
    new transports.Console()                                              
  ]
});

module.exports = logger;