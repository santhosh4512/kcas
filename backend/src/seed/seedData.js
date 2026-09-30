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

    // 5. Seed System Settings
    const SystemSetting = require('../models/SystemSetting');
    let systemSetting = await SystemSetting.findOne({ key: 'SYSTEM_CONFIG' });
    if (!systemSetting) {
      await SystemSetting.create({
        key: 'SYSTEM_CONFIG',
        gpsEnabled: true,
        campusLatitude: 12.1905865,
        campusLongitude: 79.0837848,
        campusRadiusMeters: 1000,
        locationAlertsEnabled: true,
        facultyNotificationEnabled: true,
        attendanceWarningThreshold: 75,
        academicWarningThreshold: 50,
        earlyWarningsEnabled: true,
        institutionName: 'KAMBAN COLLEGE OF ARTS AND SCIENCE FOR WOMEN',
        institutionAddress: 'Thenmathur, Tiruvannamalai – 606 603',
        institutionPhone: '04175 – 255401',
        institutionCell: '9488029091',
        institutionEmail: 'kcastvmalai@gmail.com',
      });
      console.log('⚙️ Default System & GPS Settings initialized.');
    }

    // 6. Seed Sample Faculty if none exist
    const Faculty = require('../models/Faculty');
    let facultyCount = await Faculty.countDocuments();
    let faculty1 = null;
    if (facultyCount === 0) {
      faculty1 = await Faculty.create({
        facultyId: 'FAC-001',
        employeeId: 'KCAS-FAC-001',
        name: 'Dr. S. Kanimozhi, Ph.D.',
        qualification: 'M.Sc., M.Phil., Ph.D.',
        designation: 'Associate Professor & Senior Mentor',
        department: csDept._id,
        email: 'kanimozhi@kcas.edu.in',
        phone: '94421 99881',
        joiningDate: '2020-06-15',
        experience: '12 Years',
        specialization: 'Artificial Intelligence & Data Mining',
        status: 'Active',
      });

      await Faculty.create({
        facultyId: 'FAC-002',
        employeeId: 'KCAS-FAC-002',
        name: 'Prof. R. Saravanan, M.Tech.',
        qualification: 'M.Tech., (Ph.D.)',
        designation: 'Head of the Department (HOD)',
        department: csDept._id,
        email: 'saravanan@kcas.edu.in',
        phone: '98421 77662',
        joiningDate: '2018-07-01',
        experience: '15 Years',
        specialization: 'Cloud Computing & Cyber Defense',
        status: 'Active',
      });
      console.log('👨‍🏫 Sample Faculty profiles initialized.');
    } else {
      faculty1 = await Faculty.findOne();
    }

    // 7. Seed Sample Students if none exist
    const Student = require('../models/Student');
    const studentCount = await Student.countDocuments();
    let sampleStudent1 = null;
    if (studentCount === 0) {
      sampleStudent1 = await Student.create({
        studentId: 'STU-2026-001',
        registerNumber: '23BCS001',
        rollNumber: 'CS2301',
        name: 'Vinodhini S',
        dateOfBirth: '2004-05-12',
        gender: 'Female',
        email: 'vinodhini@kcas.edu.in',
        phone: '94421 99881',
        address: 'No. 14, Gandhi Nagar, Tiruvannamalai - 606603',
        department: csDept._id,
        course: bscCs._id,
        year: 'II Year',
        semester: 'Semester 3',
        section: 'A',
        admissionYear: '2023',
        parentName: 'Sundaramoorthy M',
        parentPhone: '94421 99881',
        mentor: faculty1 ? faculty1._id : null,
        status: 'Active',
        talents: [
          { category: 'Coding', skillName: 'Full Stack Web & Python', proficiency: 'Advanced' },
          { category: 'Sports', skillName: 'Silambam / Martial Arts', proficiency: 'Expert' },
        ],
      });

      const sampleStudent2 = await Student.create({
        studentId: 'STU-2026-002',
        registerNumber: '23BCS002',
        rollNumber: 'CS2302',
        name: 'Kavitha R',
        dateOfBirth: '2004-08-20',
        gender: 'Female',
        email: 'kavitha@kcas.edu.in',
        phone: '98421 55443',
        address: 'No. 22, Anna Street, Tiruvannamalai - 606603',
        department: csDept._id,
        course: bscCs._id,
        year: 'II Year',
        semester: 'Semester 3',
        section: 'A',
        admissionYear: '2023',
        parentName: 'Ranganathan K',
        parentPhone: '98421 55443',
        mentor: faculty1 ? faculty1._id : null,
        status: 'Active',
        talents: [
          { category: 'Studies', skillName: 'Algorithmics & Mathematics', proficiency: 'Expert' },
          { category: 'Communication', skillName: 'English Oratory & Elocution', proficiency: 'Advanced' },
        ],
      });

      const sampleStudent3 = await Student.create({
        studentId: 'STU-2026-003',
        registerNumber: '23BAI001',
        rollNumber: 'AI2301',
        name: 'Abinaya M',
        dateOfBirth: '2004-11-15',
        gender: 'Female',
        email: 'abinaya@kcas.edu.in',
        phone: '97890 12345',
        address: 'No. 8, Sannathi Street, Tiruvannamalai - 606603',
        department: aidsDept._id,
        course: bscAids._id,
        year: 'II Year',
        semester: 'Semester 3',
        section: 'A',
        admissionYear: '2023',
        parentName: 'Murugan P',
        parentPhone: '97890 12345',
        mentor: faculty1 ? faculty1._id : null,
        status: 'Active',
        talents: [
          { category: 'Coding', skillName: 'Machine Learning & Python Data Science', proficiency: 'Advanced' },
        ],
      });

      // Seed Talent Scores
      const TalentScore = require('../models/TalentScore');
      await TalentScore.create({
        student: sampleStudent1._id,
        studentName: sampleStudent1.name,
        registerNumber: sampleStudent1.registerNumber,
        department: csDept._id,
        course: bscCs._id,
        scores: {
          studies: 88,
          sports: 95,
          cultural: 75,
          technical: 92,
          communication: 85,
          leadership: 80,
          other: 70,
        },
        highestScore: 95,
        primaryTalent: [{ domain: 'sports', displayName: 'Silambam / Martial Arts & Athletics' }],
        secondaryStrength: [{ domain: 'technical', displayName: 'Coding & Full Stack Web' }],
        radarData: [
          { subject: 'Studies', score: 88, fullMark: 100 },
          { subject: 'Coding', score: 92, fullMark: 100 },
          { subject: 'Sports', score: 95, fullMark: 100 },
          { subject: 'Cultural', score: 75, fullMark: 100 },
          { subject: 'Communication', score: 85, fullMark: 100 },
          { subject: 'Leadership', score: 80, fullMark: 100 },
        ],
        calculatedSummary: 'Primary Talent: Silambam / Sports (95%) • Secondary: Coding & Tech (92%)',
      });

      await TalentScore.create({
        student: sampleStudent2._id,
        studentName: sampleStudent2.name,
        registerNumber: sampleStudent2.registerNumber,
        department: csDept._id,
        course: bscCs._id,
        scores: {
          studies: 96,
          sports: 70,
          cultural: 80,
          technical: 85,
          communication: 92,
          leadership: 88,
          other: 75,
        },
        highestScore: 96,
        primaryTalent: [{ domain: 'studies', displayName: 'Academic & Mathematical Problem Solving' }],
        secondaryStrength: [{ domain: 'communication', displayName: 'English Oratory & Elocution' }],
        radarData: [
          { subject: 'Studies', score: 96, fullMark: 100 },
          { subject: 'Coding', score: 85, fullMark: 100 },
          { subject: 'Sports', score: 70, fullMark: 100 },
          { subject: 'Cultural', score: 80, fullMark: 100 },
          { subject: 'Communication', score: 92, fullMark: 100 },
          { subject: 'Leadership', score: 88, fullMark: 100 },
        ],
        calculatedSummary: 'Primary Talent: Studies (96%) • Secondary: Communication (92%)',
      });

      // Seed Verified Certificates
      const Certificate = require('../models/Certificate');
      await Certificate.create({
        student: sampleStudent1._id,
        title: 'State Level Silambam Championship Gold Medalist',
        category: 'Sports',
        issuer: 'Tamil Nadu Traditional Silambam Federation',
        issueDate: '2025-08-10',
        verificationStatus: 'Verified',
        description: 'First prize gold medal in traditional weapon rotation & sparring.',
      });

      await Certificate.create({
        student: sampleStudent1._id,
        title: 'Full Stack Cloud Developer Professional Certification',
        category: 'Technical',
        issuer: 'NPTEL / IIT Madras',
        issueDate: '2025-11-20',
        verificationStatus: 'Verified',
        description: 'Elite + Silver certification in Modern Web Architecture.',
      });

      // Seed Initial GPS Location Alert for Demonstration
      const LocationAlert = require('../models/LocationAlert');
      await LocationAlert.create({
        student: sampleStudent1._id,
        studentName: sampleStudent1.name,
        registerNumber: sampleStudent1.registerNumber,
        department: csDept._id,
        course: bscCs._id,
        year: 'II Year',
        semester: 'Semester 3',
        section: 'A',
        faculty: faculty1 ? faculty1._id : null,
        facultyName: faculty1 ? faculty1.name : 'Dr. S. Kanimozhi',
        userCoordinates: {
          latitude: 12.2356,
          longitude: 79.1245,
          accuracy: 8,
        },
        campusCoordinates: {
          latitude: 12.1905865,
          longitude: 79.0837848,
        },
        distanceFromCampusMeters: 4250,
        allowedRadiusMeters: 1000,
        date: new Date().toISOString().split('T')[0],
        time: '09:15:20',
        locationStatus: 'Outside Campus',
        attendanceAttemptStatus: 'Outside Campus - Not Automatically Marked',
        severity: 'Medium',
        status: 'Unread',
        isRead: false,
      });

      console.log('🎓 Realistic sample students, talent radar, and GPS location alert demo data created.');
    }

    console.log('✅ Foundational schema structure verified. Database is clean and ready for real student imports.');
    return true;
  } catch (err) {
    console.error('❌ Error during data seeding:', err.message);
  }
}
module.exports = seedDatabase;
