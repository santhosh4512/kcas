const User = require('../models/User');

const DEFAULT_ADMIN_EMAIL = 'santhoshsiva754@gmail.com';
const DEFAULT_ADMIN_PASS = '12345678';

/**
 * Ensures the default master admin account always exists and is valid.
 */
async function ensureDefaultAdmin() {
  try {
    let admin = await User.findOne({ email: DEFAULT_ADMIN_EMAIL }).select('+password');

    if (!admin) {
      console.log(`⚡ Creating default Master Admin account (${DEFAULT_ADMIN_EMAIL})...`);
      admin = await User.create({
        name: 'Santhosh Siva (System Administrator)',
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASS,
        role: 'admin',
        designation: 'Chief Administrator & Systems Head',
        status: 'Active',
        mustChangePassword: false,
        permissions: [
          'view_students',
          'edit_students',
          'view_attendance',
          'manage_attendance',
          'view_marks',
          'manage_marks',
          'view_talent',
          'manage_talent',
          'view_reports',
          'export_reports',
        ],
      });
      console.log(`✅ Default Master Admin (${DEFAULT_ADMIN_EMAIL}) created successfully.`);
    } else {
      // Ensure role is admin and status is active
      let needsSave = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        needsSave = true;
      }
      if (admin.status !== 'Active') {
        admin.status = 'Active';
        needsSave = true;
      }

      // Check if password matches DEFAULT_ADMIN_PASS, if not update it
      const isMatch = await admin.comparePassword(DEFAULT_ADMIN_PASS);
      if (!isMatch) {
        console.log(`ℹ️ Updating Master Admin password to match configured credentials...`);
        admin.password = DEFAULT_ADMIN_PASS;
        needsSave = true;
      }

      if (needsSave) {
        await admin.save();
        console.log(`✅ Default Master Admin verified and updated.`);
      } else {
        console.log(`✅ Default Master Admin (${DEFAULT_ADMIN_EMAIL}) verified.`);
      }
    }

    return admin;
  } catch (err) {
    console.error('❌ Error ensuring default admin account:', err.message);
  }
}

module.exports = ensureDefaultAdmin;
