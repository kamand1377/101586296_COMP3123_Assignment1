require('dotenv').config();     // loads .env values into process.env
const app = require('./app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;  // use .env PORT, otherwise 3000

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server on ${PORT}`)))
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1); // stop the app; a server without a DB is useless
  });