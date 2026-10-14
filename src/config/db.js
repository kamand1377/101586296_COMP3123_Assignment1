const mongoose = require('mongoose');

async function connectDB() {
  // wait here until the connection finishes before moving on
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected:', mongoose.connection.name); 
}

module.exports = connectDB;