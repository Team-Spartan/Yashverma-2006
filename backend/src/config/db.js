const mongoose = require('mongoose');
const dns = require('dns');

const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jaldrishti_db';

// Force DNS servers to avoid querySrv ECONNREFUSED in some Node environments when using mongodb+srv
if (dbUri.startsWith('mongodb+srv://')) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(dbUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
