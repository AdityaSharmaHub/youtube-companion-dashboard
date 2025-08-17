const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

module.exports = {
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT || 5000
};