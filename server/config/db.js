const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;
  const retryInterval = 5000;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };
      const conn = await mongoose.connect(
        process.env.MONGO_URI || 'mongodb://localhost:27017/shopsphere',
        options
      );
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries++;
      console.error(`❌ Error connecting to MongoDB (Attempt ${retries}/${maxRetries}): ${error.message}`);
      if (retries < maxRetries) {
        console.log(`   Retrying in ${retryInterval / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      } else {
        console.error(`   Please ensure your MongoDB instance is running, or if using MongoDB Atlas, check that your IP address is whitelisted in Atlas Network Access.`);
      }
    }
  }
};

module.exports = connectDB;
