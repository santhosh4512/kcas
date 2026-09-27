const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');

async function seedDatabase() {
  try {
    console.log('🌱 Initializing core structure (Departments, Courses, Subjects, Master Admin)...');

    // 1. Seed Core Departments
    let csDept = await Department.findOne({ code: 'CS' });
    if (!csDept) {
      csDept = await Department.create({
        departmentId: 'DEP-CS-01',
        name: 'Department of Computer Science',
        code: 'CS',
        hod: 'Dr. R. Saravanan, Ph.D.',
        description: 'Pioneering computing education, artificial intelligence, and software systems.',
        status: 'Active',
      });
    }

    let aidsDept = await Department.findOne({ code: 'AIDS' });
    if (!aidsDept) {
      aidsDept = await Department.create({
        departmentId: 'DEP-AIDS-02',
        name: 'Department of Artificial Intelligence & Data Science',
        code: 'AIDS',
        hod: 'Dr. M. Jayanthi, Ph.D.',
        description: 'Intelligent systems, deep learning, big data analytics, and generative AI.',
        status: 'Active',
      });
    }

    let itDept = await Department.findOne({ code: 'IT' });
    if (!itDept) {
      itDept = await Department.create({
        departmentId: 'DEP-IT-03',
        name: 'Department of Information Technology',
        code: 'IT',
        hod: 'Dr. K. Meenakshi, Ph.D.',
        description: 'Cloud architectures, cybersecurity, and enterprise software engineering.',
        status: 'Active',
      });
    }

    let bcaDept = await Department.findOne({ code: 'BCA' });
    if (!bcaDept) {
      bcaDept = await Department.create({
        departmentId: 'DEP-BCA-04',
        name: 'Department of Computer Applications (BCA)',
        code: 'BCA',
        hod: 'Prof. S. Suresh Kumar, M.Phil.',
        description: 'Applied software development, mobile frameworks, and modern web applications.',
        status: 'Active',
      });
    }

    // 2. Seed Courses
    let bscCs = await Course.findOne({ courseCode: 'BSCCS' });
    if (!bscCs) {
      bscCs = await Course.create({
        courseId: 'CRS-CS-01',
        courseName: 'B.Sc. Computer Science',
        courseCode: 'BSCCS',
        department: csDept._id,
        duration: '3 Years (6 Semesters)',
        courseType: 'Undergraduate (UG)',
        status: 'Active',
      });
    }

    let bscAids = await Course.findOne({ courseCode: 'BSCAIDS' });
    if (!bscAids) {
      bscAids = await Course.create({
        courseId: 'CRS-AIDS-02',
        courseName: 'B.Sc. AI & Data Science',
        courseCode: 'BSCAIDS',
        department: aidsDept._id,
        duration: '3 Years (6 Semesters)',
        courseType: 'Undergraduate (UG)',
        status: 'Active',
      });
    }

    let bcaCourse = await Course.findOne({ courseCode: 'BCAUG' });
    if (!bcaCourse) {
      bcaCourse = await Course.create({
        courseId: 'CRS-BCA-03',
        courseName: 'Bachelor of Computer Applications',
        courseCode: 'BCAUG',
        department: bcaDept._id,
        duration: '3 Years (6 Semesters)',
        courseType: 'Undergraduate (UG)',
        status: 'Active',
      });
    }

    // 3. Seed Subjects
    const subjectsSeed = [
      { subjectId: 'SUB-CS-301', subjectName: 'Data Structures & Algorithms', subjectCode: 'CS301', department: csDept._id, course: bscCs._id, semester: 'Semester 3', credits: 4 },
      { subjectId: 'SUB-CS-302', subjectName: 'Database Management Systems', subjectCode: 'CS302', department: csDept._id, course: bscCs._id, semester: 'Semester 3', credits: 4 },
      { subjectId: 'SUB-CS-303', subjectName: 'Operating Systems & Linux', subjectCode: 'CS303', department: csDept._id, course: bscCs._id, semester: 'Semester 3', credits: 3 },
      { subjectId: 'SUB-CS-304', subjectName: 'Web Technology & Full Stack', subjectCode: 'CS304', department: csDept._id, course: bscCs._id, semester: 'Semester 3', credits: 3 },
      { subjectId: 'SUB-AI-301', subjectName: 'Machine Learning Fundamentals', subjectCode: 'AI301', department: aidsDept._id, course: bscAids._id, semester: 'Semester 3', credits: 4 },
      { subjectId: 'SUB-AI-302', subjectName: 'Applied Python & Data Visualization', subjectCode: 'AI302', department: aidsDept._id, course: bscAids._id, semester: 'Semester 3', credits: 4 },
    ];

    for (const sub of subjectsSeed) {
      const existing = await Subject.findOne({ subjectCode: sub.subjectCode });
      if (!existing) {
        await Subject.create(sub);
      }
    }

    // 4. Seed Master Admin Account
    let masterAdmin = await User.findOne({ email: 'santhoshsiva754@gmail.com' });
    if (!masterAdmin) {
      masterAdmin = await User.create({
        name: 'Master Administrator',
        email: 'santhoshsiva754@gmail.com',
        password: 'admin123',
        role: 'admin',
        designation: 'Chief System Administrator',
        department: csDept._id,
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
      console.log('🔑 Master Admin created: santhoshsiva754@gmail.com');
    }


    console.log('✅ Foundational schema structure verified. Database is clean and ready for real student imports.');
    return true;
  } catch (err) {
    console.error('❌ Error during data seeding:', err.message);
  }
}
module.exports = seedDatabase;
