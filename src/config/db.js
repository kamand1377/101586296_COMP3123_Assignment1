const mongoose = require('mongoose');
let connecting = null;

module.exports = function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!connecting) connecting = mongoose.connect(process.env.MONGODB_URI);
  return connecting;
};