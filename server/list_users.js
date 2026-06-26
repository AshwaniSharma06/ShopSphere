const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`- Email: ${u.email}, Role: ${u.role}, Name: ${u.name}`);
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

run();
