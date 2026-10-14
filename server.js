require('dotenv').config();     // loads .env values into process.env
const app = require('./app');

const PORT = process.env.PORT || 3000;  // use .env PORT, otherwise 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));