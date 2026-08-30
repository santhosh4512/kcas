import mongoose from 'mongoose';
import User from './models/User';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kcas_department_db';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const DEFAULT_ADMIN_EMAIL = 'santhoshsiva754@gmail.com';
export const DEFAULT_ADMIN_PASS = '12345678';

export async function ensureDefaultAdmin() {
  try {
    let admin = await User.findOne({ email: DEFAULT_ADMIN_EMAIL }).select('+password');

    if (!admin) {
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
      console.log(`✅ Default Master Admin (${DEFAULT_ADMIN_EMAIL}) created in database.`);
    } else {
      let needsSave = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        needsSave = true;
      }
      if (admin.status !== 'Active') {
        admin.status = 'Active';
        needsSave = true;
      }

      const isMatch = await admin.comparePassword(DEFAULT_ADMIN_PASS);
      if (!isMatch) {
        admin.password = DEFAULT_ADMIN_PASS;
        needsSave = true;
      }

      if (needsSave) {
        await admin.save();
        console.log(`✅ Default Master Admin (${DEFAULT_ADMIN_EMAIL}) updated and verified.`);
      }
    }
    return admin;
  } catch (err) {
    console.error('Error ensuring default admin in db:', err.message);
  }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongooseInstance) => {
      // On connection, ensure master admin exists
      await ensureDefaultAdmin();
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
