const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

async function ensureAdminUser() {
  await connectDB();
  try {
    let admin = await User.findOne({ email: 'santhoshsiva754@gmail.com' });
    if (!admin) {
      admin = new User({
        name: 'Santhosh Siva (Admin)',
        email: 'santhoshsiva754@gmail.com',
        password: '12345678',
        role: 'admin',
        status: 'Active',
        mustChangePassword: false,
      });
      await admin.save();
      console.log('✅ Created Admin user santhoshsiva754@gmail.com with password 12345678');
    } else {
      admin.password = '12345678';
      admin.role = 'admin';
      admin.status = 'Active';
      admin.mustChangePassword = false;
      await admin.save();
      console.log('✅ Updated Admin user santhoshsiva754@gmail.com with password 12345678');
    }
  } catch (err) {
    console.error('Error ensuring admin:', err);
  } finally {
    process.exit(0);
  }
}

ensureAdminUser();
