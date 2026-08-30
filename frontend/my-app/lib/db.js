import mongoose from 'mongoose';
import User from './models/User';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb+srv://santhosh:santhosh01@cluster0.wqvhoss.mongodb.net/kcas_department_db?appName=Cluster0';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const DEFAULT_ADMIN_EMAIL = 'santhoshsiva754@gmail.com';
export const DEFAULT_ADMIN_PASS = '12345678';

// Core demo institutional accounts
const CORE_USERS = [
  {
    name: 'Santhosh Siva (System Administrator)',
    email: 'santhoshsiva754@gmail.com',
    password: '12345678',
    role: 'admin',
    designation: 'Chief Administrator & Systems Head',
    status: 'Active',
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
  },
  {
    name: 'Dr. S. Meenakshi (Principal & Admin)',
    email: 'admin@kcas.edu.in',
    password: 'Admin@123',
    role: 'admin',
    designation: 'Principal & Head of Institution',
    status: 'Active',
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
  },
  {
    name: 'Mrs. M. Saranya (Assistant Professor)',
    email: 'faculty@kcas.edu.in',
    password: 'Faculty@123',
    role: 'faculty',
    designation: 'Assistant Professor',
    employeeId: 'EMP102',
    status: 'Active',
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
  },
  {
    name: 'Pavithra D (Student)',
    email: 'student@kcas.edu.in',
    password: 'Student@123',
    role: 'student',
    status: 'Active',
    permissions: [],
  },
];

export async function ensureDefaultAdmin() {
  try {
    for (const u of CORE_USERS) {
      const email = u.email.toLowerCase();
      let user = await User.findOne({ email }).select('+password');

      if (!user) {
        await User.create({
          ...u,
          email,
          mustChangePassword: false,
        });
        console.log(`✅ User (${email}) created in database.`);
      } else {
        let needsSave = false;
        if (user.role !== u.role) {
          user.role = u.role;
          needsSave = true;
        }
        if (user.status !== 'Active') {
          user.status = 'Active';
          needsSave = true;
        }
        if (u.designation && user.designation !== u.designation) {
          user.designation = u.designation;
          needsSave = true;
        }
        if (u.permissions && JSON.stringify(user.permissions) !== JSON.stringify(u.permissions)) {
          user.permissions = u.permissions;
          needsSave = true;
        }

        const isMatch = await user.comparePassword(u.password);
        if (!isMatch) {
          user.password = u.password;
          needsSave = true;
        }

        if (needsSave) {
          await user.save();
          console.log(`✅ User (${email}) verified and updated.`);
        }
      }
    }
  } catch (err) {
    console.error('Error ensuring core users in db:', err.message);
  }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: 'kcas_department_db',
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongooseInstance) => {
      // On connection, ensure master admin and institutional users exist
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
