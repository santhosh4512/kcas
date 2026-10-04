const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

const DEFAULT_ADMIN_EMAIL = 'santhoshsiva754@gmail.com';
const DEFAULT_ADMIN_PASS = '12345678';

async function ensureDefaultAdmin() {
  try {
    // 1. Master Administrator
    let admin = await User.findOne({ email: DEFAULT_ADMIN_EMAIL }).select('+password');
    if (!admin) {
      admin = await User.create({
        name: 'Master Administrator',
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
      console.log(`✅ Default Master Admin (${DEFAULT_ADMIN_EMAIL}) created.`);
    }

    // 2. Institutional Admin
    let instAdmin = await User.findOne({ email: 'admin@kcas.edu.in' }).select('+password');
    if (!instAdmin) {
      await User.create({
        name: 'Institutional Administrator',
        email: 'admin@kcas.edu.in',
        password: 'Admin@123',
        role: 'admin',
        designation: 'Principal & Chief Administrator',
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
      console.log(`✅ Institutional Admin (admin@kcas.edu.in) created.`);
    }

    // 3. Faculty Accounts
    const kanimozhiFac = await Faculty.findOne({ email: 'kanimozhi@kcas.edu.in' });

    let facultyUser = await User.findOne({ email: 'faculty@kcas.edu.in' }).select('+password');
    if (!facultyUser) {
      await User.create({
        name: 'Dr. S. Kanimozhi (Faculty Mentor)',
        email: 'faculty@kcas.edu.in',
        password: 'Faculty@123',
        role: 'faculty',
        designation: 'Associate Professor & Mentor',
        referenceId: kanimozhiFac?._id,
        roleRefModel: 'Faculty',
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
      console.log(`✅ Default Faculty (faculty@kcas.edu.in) created.`);
    }

    let kanimozhiUser = await User.findOne({ email: 'kanimozhi@kcas.edu.in' }).select('+password');
    if (!kanimozhiUser) {
      await User.create({
        name: 'Dr. S. Kanimozhi, Ph.D.',
        email: 'kanimozhi@kcas.edu.in',
        password: 'faculty123',
        role: 'faculty',
        designation: 'Associate Professor & Mentor',
        referenceId: kanimozhiFac?._id,
        roleRefModel: 'Faculty',
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
      console.log(`✅ Faculty (kanimozhi@kcas.edu.in) created.`);
    }

    // 4. Student Accounts linked to Vinodhini A
    const vinodhiniStudent = await Student.findOne({ registerNumber: '23BCS001' });

    let studentUser = await User.findOne({ email: 'student@kcas.edu.in' }).select('+password');
    if (!studentUser) {
      await User.create({
        name: 'Vinodhini A',
        email: 'student@kcas.edu.in',
        password: 'Student@123',
        role: 'student',
        designation: 'B.Sc. Computer Science Scholar',
        referenceId: vinodhiniStudent?._id,
        roleRefModel: 'Student',
        status: 'Active',
        mustChangePassword: false,
        permissions: ['view_attendance', 'view_marks', 'view_talent', 'view_reports'],
      });
      console.log(`✅ Default Student (student@kcas.edu.in -> Vinodhini A) created.`);
    } else if (vinodhiniStudent && String(studentUser.referenceId) !== String(vinodhiniStudent._id)) {
      studentUser.referenceId = vinodhiniStudent._id;
      studentUser.name = 'Vinodhini A';
      await studentUser.save();
    }

    let vinodhiniDirectUser = await User.findOne({ email: 'vinodhini@kcas.edu.in' }).select('+password');
    if (!vinodhiniDirectUser) {
      await User.create({
        name: 'Vinodhini A',
        email: 'vinodhini@kcas.edu.in',
        password: 'Student@123',
        role: 'student',
        designation: 'B.Sc. Computer Science Scholar',
        referenceId: vinodhiniStudent?._id,
        roleRefModel: 'Student',
        status: 'Active',
        mustChangePassword: false,
        permissions: ['view_attendance', 'view_marks', 'view_talent', 'view_reports'],
      });
      console.log(`✅ Direct Student User (vinodhini@kcas.edu.in) created.`);
    } else if (vinodhiniStudent && String(vinodhiniDirectUser.referenceId) !== String(vinodhiniStudent._id)) {
      vinodhiniDirectUser.referenceId = vinodhiniStudent._id;
      await vinodhiniDirectUser.save();
    }

    return admin;
  } catch (err) {
    console.error('❌ Error ensuring default accounts:', err.message);
  }
}

module.exports = ensureDefaultAdmin;
