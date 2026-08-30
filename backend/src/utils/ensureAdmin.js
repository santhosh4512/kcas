require('dotenv').config();
const User = require('../models/User');
const connectDB = require('../config/db');

async function ensureAdminUser() {
  await connectDB();
  try {
    const email = 'santhoshsiva754@gmail.com';
    let admin = await User.findOne({ email }).select('+password');
    if (!admin) {
      admin = await User.create({
        name: 'Santhosh Siva (Admin)',
        email,
        password: '12345678',
        role: 'admin',
        status: 'Active',
        mustChangePassword: false,
      });
      console.log('✅ Created Admin user santhoshsiva754@gmail.com with password 12345678');
    } else {
      let needsSave = false;
      if (admin.role !== 'admin') { admin.role = 'admin'; needsSave = true; }
      if (admin.status !== 'Active') { admin.status = 'Active'; needsSave = true; }
      const isMatch = await admin.comparePassword('12345678');
      if (!isMatch) { admin.password = '12345678'; needsSave = true; }
      if (needsSave) await admin.save();
      console.log('✅ Verified Admin user santhoshsiva754@gmail.com');
    }
  } catch (err) {
    console.error('Error ensuring admin:', err);
  } finally {
    process.exit(0);
  }
}

ensureAdminUser();
