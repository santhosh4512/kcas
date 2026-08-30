const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const TalentScore = require('../models/TalentScore');
const Skill = require('../models/Skill');
const AuditLog = require('../models/AuditLog');
const talentService = require('../services/talentService');

async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('ℹ️ Database already contains records. Skipping initial seeding.');
      return;
    }

    console.log('🌱 Seeding database with Kamban College (KCAS) institutional data...');

    // 1. Create Default Users (Admin, Staff Faculty with permissions, Student)
    const adminUser = await User.create({
      name: 'Santhosh Siva (System Administrator)',
      email: 'santhoshsiva754@gmail.com',
      password: '12345678',
      role: 'admin',
      status: 'Active',
      mustChangePassword: false,
    });

    const institutionalAdmin = await User.create({
      name: 'Dr. S. Meenakshi (Principal & Admin)',
      email: 'admin@kcas.edu.in',
      password: 'Admin@123',
      role: 'admin',
      status: 'Active',
      mustChangePassword: false,
    });

    const facultyUser = await User.create({
      name: 'Dr. K. Anitha',
      email: 'faculty@kcas.edu.in',
      password: 'Faculty@123',
      role: 'faculty',
      employeeId: 'KCAS-FAC-001',
      designation: 'Associate Professor & HOD',
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

    const studentUser = await User.create({
      name: 'Vinodhini R',
      email: 'student@kcas.edu.in',
      password: 'Student@123',
      role: 'student',
      status: 'Active',
      mustChangePassword: false,
      permissions: [],
    });

    // 2. Create Departments
    const deptsData = [
      {
        departmentId: 'DEPT-CS',
        name: 'B.Sc Computer Science',
        code: 'CS',
        hod: 'Dr. K. Anitha',
        description: 'Department of Computer Science focusing on Modern Computing, AI, and Software Engineering.',
        status: 'Active',
      },
      {
        departmentId: 'DEPT-DS',
        name: 'B.Sc Data Science',
        code: 'DS',
        hod: 'Dr. R. Kavitha',
        description: 'Advanced data analytics, machine learning, and statistical computing for women in STEM.',
        status: 'Active',
      },
      {
        departmentId: 'DEPT-COM',
        name: 'B.Com (General & Corporate)',
        code: 'COM',
        hod: 'Dr. M. Soundarya',
        description: 'Commerce and Business Administration, Banking, Finance, and Corporate Accounting.',
        status: 'Active',
      },
      {
        departmentId: 'DEPT-ENG',
        name: 'B.A English Literature',
        code: 'ENG',
        hod: 'Mrs. V. Jayanthi',
        description: 'Department of English Language, World Literature, Phonetics, and Soft Skills.',
        status: 'Active',
      },
      {
        departmentId: 'DEPT-CHEM',
        name: 'B.Sc Chemistry',
        code: 'CHEM',
        hod: 'Dr. P. Revathi',
        description: 'Organic, Inorganic and Analytical Chemistry with advanced laboratory research.',
        status: 'Active',
      },
    ];

    const departments = await Department.insertMany(deptsData);
    const csDept = departments.find((d) => d.code === 'CS');
    const dsDept = departments.find((d) => d.code === 'DS');
    const comDept = departments.find((d) => d.code === 'COM');
    const engDept = departments.find((d) => d.code === 'ENG');

    // 3. Create Courses
    const coursesData = [
      {
        courseId: 'CRS-BSC-CS',
        courseName: 'Bachelor of Science in Computer Science',
        courseCode: 'BSC-CS',
        department: csDept._id,
        duration: '3 Years (6 Semesters)',
        courseType: 'Undergraduate (UG)',
        status: 'Active',
      },
      {
        courseId: 'CRS-MSC-CS',
        courseName: 'Master of Science in Computer Science',
        courseCode: 'MSC-CS',
        department: csDept._id,
        duration: '2 Years (4 Semesters)',
        courseType: 'Postgraduate (PG)',
        status: 'Active',
      },
      {
        courseId: 'CRS-BSC-DS',
        courseName: 'Bachelor of Science in Data Science',
        courseCode: 'BSC-DS',
        department: dsDept._id,
        duration: '3 Years (6 Semesters)',
        courseType: 'Undergraduate (UG)',
        status: 'Active',
      },
      {
        courseId: 'CRS-BCOM',
        courseName: 'Bachelor of Commerce',
        courseCode: 'BCOM',
        department: comDept._id,
        duration: '3 Years (6 Semesters)',
        courseType: 'Undergraduate (UG)',
        status: 'Active',
      },
      {
        courseId: 'CRS-BA-ENG',
        courseName: 'Bachelor of Arts in English',
        courseCode: 'BA-ENG',
        department: engDept._id,
        duration: '3 Years (6 Semesters)',
        courseType: 'Undergraduate (UG)',
        status: 'Active',
      },
    ];

    const courses = await Course.insertMany(coursesData);
    const bscCsCourse = courses.find((c) => c.courseCode === 'BSC-CS');
    const bscDsCourse = courses.find((c) => c.courseCode === 'BSC-DS');
    const bcomCourse = courses.find((c) => c.courseCode === 'BCOM');

    // 4. Create Faculty
    const facultyData = [
      {
        facultyId: 'FAC-EMP101',
        employeeId: 'EMP101',
        name: 'Dr. K. Anitha',
        qualification: 'Ph.D., M.Sc., M.Phil.',
        designation: 'Associate Professor & HOD',
        department: csDept._id,
        email: 'anitha.cs@kcas.edu.in',
        phone: '9840123456',
        experience: '14 Years',
        specialization: 'Artificial Intelligence, Database Systems',
        status: 'Active',
      },
      {
        facultyId: 'FAC-EMP102',
        employeeId: 'EMP102',
        name: 'Mrs. M. Saranya',
        qualification: 'M.C.A., M.Phil., SET',
        designation: 'Assistant Professor',
        department: csDept._id,
        email: 'faculty@kcas.edu.in', // Default Demo Faculty
        phone: '9840123457',
        experience: '8 Years',
        specialization: 'Web Technologies, Full Stack Development',
        status: 'Active',
      },
      {
        facultyId: 'FAC-EMP103',
        employeeId: 'EMP103',
        name: 'Dr. R. Kavitha',
        qualification: 'Ph.D., M.Tech.',
        designation: 'Associate Professor & HOD',
        department: dsDept._id,
        email: 'kavitha.ds@kcas.edu.in',
        phone: '9840123458',
        experience: '11 Years',
        specialization: 'Data Mining, Python Programming',
        status: 'Active',
      },
      {
        facultyId: 'FAC-EMP104',
        employeeId: 'EMP104',
        name: 'Dr. M. Soundarya',
        qualification: 'Ph.D., M.Com., MBA',
        designation: 'Associate Professor & HOD',
        department: comDept._id,
        email: 'soundarya.com@kcas.edu.in',
        phone: '9840123459',
        experience: '12 Years',
        specialization: 'Corporate Accounting, Financial Management',
        status: 'Active',
      },
    ];

    const faculties = await Faculty.insertMany(facultyData);
    const demoFaculty = faculties.find((f) => f.employeeId === 'EMP102');

    // Create Faculty login
    await User.create({
      name: 'Mrs. M. Saranya (Assistant Professor)',
      email: 'faculty@kcas.edu.in',
      password: 'Faculty@123',
      role: 'faculty',
      department: csDept._id,
      referenceId: demoFaculty._id,
      roleRefModel: 'Faculty',
      status: 'Active',
    });

    // 5. Create Subjects
    const subjectsData = [
      {
        subjectId: 'SUB-CS101',
        subjectCode: 'CS101',
        subjectName: 'Python Programming & Problem Solving',
        course: bscCsCourse._id,
        department: csDept._id,
        semester: 'Semester 1',
        credits: 4,
        faculty: demoFaculty._id,
        status: 'Active',
      },
      {
        subjectId: 'SUB-CS102',
        subjectCode: 'CS102',
        subjectName: 'Data Structures and Algorithms',
        course: bscCsCourse._id,
        department: csDept._id,
        semester: 'Semester 1',
        credits: 4,
        faculty: faculties[0]._id,
        status: 'Active',
      },
      {
        subjectId: 'SUB-CS103',
        subjectCode: 'CS103',
        subjectName: 'Database Management Systems (DBMS)',
        course: bscCsCourse._id,
        department: csDept._id,
        semester: 'Semester 1',
        credits: 4,
        faculty: faculties[0]._id,
        status: 'Active',
      },
      {
        subjectId: 'SUB-DS101',
        subjectCode: 'DS101',
        subjectName: 'Foundations of Data Science & Statistics',
        course: bscDsCourse._id,
        department: dsDept._id,
        semester: 'Semester 1',
        credits: 4,
        faculty: faculties[2]._id,
        status: 'Active',
      },
      {
        subjectId: 'SUB-COM101',
        subjectCode: 'COM101',
        subjectName: 'Financial Accounting & Reporting',
        course: bcomCourse._id,
        department: comDept._id,
        semester: 'Semester 1',
        credits: 4,
        faculty: faculties[3]._id,
        status: 'Active',
      },
    ];

    const subjects = await Subject.insertMany(subjectsData);
    const pySubject = subjects.find((s) => s.subjectCode === 'CS101');
    const dsSubject = subjects.find((s) => s.subjectCode === 'CS102');
    const dbSubject = subjects.find((s) => s.subjectCode === 'CS103');

    // 6. Create Students with diverse realistic profiles
    const studentsData = [
      // Student A: High Academic / Studies Focus
      {
        studentId: 'STU-24UBCS001',
        registerNumber: '24UBCS001',
        rollNumber: 'CS2401',
        name: 'Kanimozhi R',
        gender: 'Female',
        dob: '2005-04-12',
        email: 'kanimozhi.cs@kcas.edu.in',
        phone: '9876543201',
        address: 'Gandhi Nagar, Tiruvannamalai',
        department: csDept._id,
        course: bscCsCourse._id,
        year: 'I Year',
        semester: 'Semester 1',
        section: 'A',
        parentName: 'Rajendran M',
        parentPhone: '9443322101',
        status: 'Active',
      },
      // Student B: Sports Highest (Silambam / State Champion)
      {
        studentId: 'STU-24UBCS002',
        registerNumber: '24UBCS002',
        rollNumber: 'CS2402',
        name: 'Vinodhini S',
        gender: 'Female',
        dob: '2005-06-18',
        email: 'vinodhini.cs@kcas.edu.in',
        phone: '9876543202',
        address: 'Chengam Road, Tiruvannamalai',
        department: csDept._id,
        course: bscCsCourse._id,
        year: 'I Year',
        semester: 'Semester 1',
        section: 'A',
        parentName: 'Sundaram P',
        parentPhone: '9443322102',
        status: 'Active',
      },
      // Student C: Technical Skills Highest (Web Dev, Coding) - Default Demo Student
      {
        studentId: 'STU-24UBCS003',
        registerNumber: '24UBCS003',
        rollNumber: 'CS2403',
        name: 'Pavithra D',
        gender: 'Female',
        dob: '2005-09-22',
        email: 'student@kcas.edu.in', // Default Demo Student
        phone: '9876543203',
        address: 'Anna Nagar, Tiruvannamalai',
        department: csDept._id,
        course: bscCsCourse._id,
        year: 'I Year',
        semester: 'Semester 1',
        section: 'A',
        parentName: 'Dhanasekar V',
        parentPhone: '9443322103',
        status: 'Active',
      },
      // Student D: Arts & Culture Highest (Bharatanatyam / Classical Vocalist)
      {
        studentId: 'STU-24UBCS004',
        registerNumber: '24UBCS004',
        rollNumber: 'CS2404',
        name: 'Keerthana M',
        gender: 'Female',
        dob: '2005-11-05',
        email: 'keerthana.cs@kcas.edu.in',
        phone: '9876543204',
        address: 'Mathalangulam, Tiruvannamalai',
        department: csDept._id,
        course: bscCsCourse._id,
        year: 'I Year',
        semester: 'Semester 1',
        section: 'A',
        parentName: 'Murugan K',
        parentPhone: '9443322104',
        status: 'Active',
      },
      // Student E: Communication & Leadership Highest (Debate Captain)
      {
        studentId: 'STU-24UBCS005',
        registerNumber: '24UBCS005',
        rollNumber: 'CS2405',
        name: 'Deepika T',
        gender: 'Female',
        dob: '2005-02-14',
        email: 'deepika.cs@kcas.edu.in',
        phone: '9876543205',
        address: 'Polur Road, Tiruvannamalai',
        department: csDept._id,
        course: bscCsCourse._id,
        year: 'I Year',
        semester: 'Semester 1',
        section: 'A',
        parentName: 'Thirunavukkarasu G',
        parentPhone: '9443322105',
        status: 'Active',
      },
      // Student F: Joint Highest Tie Edge Case (92% Sports & 92% Arts Tied!)
      {
        studentId: 'STU-24UBCS006',
        registerNumber: '24UBCS006',
        rollNumber: 'CS2406',
        name: 'Sangeetha N',
        gender: 'Female',
        dob: '2005-07-30',
        email: 'sangeetha.cs@kcas.edu.in',
        phone: '9876543206',
        address: 'Vettavalam, Tiruvannamalai',
        department: csDept._id,
        course: bscCsCourse._id,
        year: 'I Year',
        semester: 'Semester 1',
        section: 'A',
        parentName: 'Natarajan S',
        parentPhone: '9443322106',
        status: 'Active',
      },
      // Additional Department Students
      {
        studentId: 'STU-24UBDS001',
        registerNumber: '24UBDS001',
        rollNumber: 'DS2401',
        name: 'Abinaya B',
        gender: 'Female',
        dob: '2005-03-10',
        email: 'abinaya.ds@kcas.edu.in',
        phone: '9876543207',
        address: 'Kilpennathur, Tiruvannamalai',
        department: dsDept._id,
        course: bscDsCourse._id,
        year: 'I Year',
        semester: 'Semester 1',
        section: 'A',
        parentName: 'Balaji R',
        parentPhone: '9443322107',
        status: 'Active',
      },
      {
        studentId: 'STU-24UCOM001',
        registerNumber: '24UCOM001',
        rollNumber: 'COM2401',
        name: 'Sandhiya P',
        gender: 'Female',
        dob: '2005-08-15',
        email: 'sandhiya.com@kcas.edu.in',
        phone: '9876543208',
        address: 'Arani, Tiruvannamalai',
        department: comDept._id,
        course: bcomCourse._id,
        year: 'I Year',
        semester: 'Semester 1',
        section: 'A',
        parentName: 'Palanisamy V',
        parentPhone: '9443322108',
        status: 'Active',
      },
    ];

    const students = await Student.insertMany(studentsData);
    const demoStudent = students.find((s) => s.registerNumber === '24UBCS003');

    // Create Student Login
    await User.create({
      name: 'Pavithra D (Student)',
      email: 'student@kcas.edu.in',
      password: 'Student@123',
      role: 'student',
      department: csDept._id,
      referenceId: demoStudent._id,
      roleRefModel: 'Student',
      status: 'Active',
    });

    // 7. Seed Marks & Results
    const marksData = [
      // Kanimozhi (High Academic - 94, 91, 95)
      {
        student: students[0]._id,
        registerNumber: students[0].registerNumber,
        studentName: students[0].name,
        department: csDept._id,
        course: bscCsCourse._id,
        semester: 'Semester 1',
        subject: pySubject._id,
        subjectCode: pySubject.subjectCode,
        subjectName: pySubject.subjectName,
        internalMark: 24,
        externalMark: 70,
      },
      {
        student: students[0]._id,
        registerNumber: students[0].registerNumber,
        studentName: students[0].name,
        department: csDept._id,
        course: bscCsCourse._id,
        semester: 'Semester 1',
        subject: dsSubject._id,
        subjectCode: dsSubject.subjectCode,
        subjectName: dsSubject.subjectName,
        internalMark: 23,
        externalMark: 68,
      },
      // Vinodhini (Sports - 78% Marks)
      {
        student: students[1]._id,
        registerNumber: students[1].registerNumber,
        studentName: students[1].name,
        department: csDept._id,
        course: bscCsCourse._id,
        semester: 'Semester 1',
        subject: pySubject._id,
        subjectCode: pySubject.subjectCode,
        subjectName: pySubject.subjectName,
        internalMark: 20,
        externalMark: 58,
      },
      // Pavithra (Technical - 85% Marks)
      {
        student: students[2]._id,
        registerNumber: students[2].registerNumber,
        studentName: students[2].name,
        department: csDept._id,
        course: bscCsCourse._id,
        semester: 'Semester 1',
        subject: pySubject._id,
        subjectCode: pySubject.subjectCode,
        subjectName: pySubject.subjectName,
        internalMark: 24,
        externalMark: 66,
      },
      {
        student: students[2]._id,
        registerNumber: students[2].registerNumber,
        studentName: students[2].name,
        department: csDept._id,
        course: bscCsCourse._id,
        semester: 'Semester 1',
        subject: dsSubject._id,
        subjectCode: dsSubject.subjectCode,
        subjectName: dsSubject.subjectName,
        internalMark: 22,
        externalMark: 60,
      },
      // Keerthana (Arts - 74% Marks)
      {
        student: students[3]._id,
        registerNumber: students[3].registerNumber,
        studentName: students[3].name,
        department: csDept._id,
        course: bscCsCourse._id,
        semester: 'Semester 1',
        subject: pySubject._id,
        subjectCode: pySubject.subjectCode,
        subjectName: pySubject.subjectName,
        internalMark: 19,
        externalMark: 55,
      },
      // Deepika (Communication - 82% Marks)
      {
        student: students[4]._id,
        registerNumber: students[4].registerNumber,
        studentName: students[4].name,
        department: csDept._id,
        course: bscCsCourse._id,
        semester: 'Semester 1',
        subject: pySubject._id,
        subjectCode: pySubject.subjectCode,
        subjectName: pySubject.subjectName,
        internalMark: 21,
        externalMark: 61,
      },
      // Sangeetha (Joint Sports & Arts - 76% Marks)
      {
        student: students[5]._id,
        registerNumber: students[5].registerNumber,
        studentName: students[5].name,
        department: csDept._id,
        course: bscCsCourse._id,
        semester: 'Semester 1',
        subject: pySubject._id,
        subjectCode: pySubject.subjectCode,
        subjectName: pySubject.subjectName,
        internalMark: 18,
        externalMark: 58,
      },
    ];

    for (const m of marksData) {
      await Mark.create(m);
    }

    // 8. Seed Attendance Sessions
    const dates = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05'];
    for (const d of dates) {
      const records = students.slice(0, 6).map((st, idx) => {
        // Vinodhini occasionally On Duty for state sports tournament
        if (st.registerNumber === '24UBCS002' && d === '2026-08-03') {
          return { student: st._id, registerNumber: st.registerNumber, status: 'On Duty', remarks: 'State Silambam Meet' };
        }
        // Deepika absent on day 4
        if (st.registerNumber === '24UBCS005' && d === '2026-08-04') {
          return { student: st._id, registerNumber: st.registerNumber, status: 'Absent', remarks: 'Medical Leave' };
        }
        return { student: st._id, registerNumber: st.registerNumber, status: 'Present', remarks: '' };
      });

      const pres = records.filter((r) => r.status === 'Present' || r.status === 'On Duty').length;
      await Attendance.create({
        department: csDept._id,
        course: bscCsCourse._id,
        year: 'I Year',
        semester: 'Semester 1',
        section: 'A',
        subject: pySubject._id,
        date: d,
        records,
        totalStudents: records.length,
        presentCount: pres,
        absentCount: records.length - pres,
        markedBy: adminUser._id,
      });
    }

    // 9. Seed Student Skill & Talent Intelligence Profiles (Deterministic Engine Execution)
    const studentTalentProfiles = [
      {
        student: students[0],
        scores: { studies: 94, sports: 65, arts: 70, technical: 78, communication: 76, leadership: 70, other: 60 },
        skills: [
          { name: 'Academic Research & Problem Solving', cat: 'Studies', level: 'Expert', pct: 95, exp: '3 Years', ach: '1st Rank in District Merit Exam', pass: 'Mathematics & Algorithms' },
          { name: 'Python Basics', cat: 'Technical Skills', level: 'Intermediate', pct: 80, exp: '1 Year', cert: 'Coursera Python for Everybody' },
        ],
      },
      {
        student: students[1],
        scores: { studies: 78, sports: 96, arts: 68, technical: 62, communication: 75, leadership: 82, other: 70 },
        skills: [
          { name: 'Silambam (Stick Martial Art)', cat: 'Sports', level: 'Master', pct: 98, exp: '6 Years', ach: 'Gold Medal - Tamil Nadu State Championship 2025', cert: 'National Silambam Federation Certificate', pass: 'Traditional Tamil Martial Arts' },
          { name: '100m & 200m Sprint Athletics', cat: 'Sports', level: 'Advanced', pct: 92, exp: '4 Years', ach: 'University Division 1 Winner' },
        ],
      },
      {
        student: students[2],
        scores: { studies: 85, sports: 60, arts: 65, technical: 95, communication: 78, leadership: 80, other: 72 },
        skills: [
          { name: 'Full-Stack Web Development (Next.js/React)', cat: 'Technical Skills', level: 'Expert', pct: 96, exp: '2 Years', ach: 'Winner - Inter-College Hackathon 2025', cert: 'Meta Front-End Developer Certified', pass: 'Building modern responsive web apps' },
          { name: 'Python & Data Science', cat: 'Technical Skills', level: 'Advanced', pct: 90, exp: '2 Years', cert: 'Kaggle Python Specialist' },
          { name: 'UI/UX Design with Figma', cat: 'Technical Skills', level: 'Advanced', pct: 88, exp: '1 Year', ach: 'Designed KCAS Department Portal Prototype' },
        ],
      },
      {
        student: students[3],
        scores: { studies: 74, sports: 55, arts: 93, technical: 58, communication: 78, leadership: 70, other: 80 },
        skills: [
          { name: 'Bharatanatyam Classical Dance', cat: 'Arts & Culture', level: 'Master', pct: 96, exp: '8 Years', ach: 'Arangetram Performed at Natyanjali Festival', cert: 'Kalai Sudar Award 2024', pass: 'Classical Dance & Choreography' },
          { name: 'Carnatic Classical Vocal', cat: 'Arts & Culture', level: 'Advanced', pct: 90, exp: '5 Years', cert: 'Govt Music College Grade 4' },
        ],
      },
      {
        student: students[4],
        scores: { studies: 82, sports: 64, arts: 72, technical: 68, communication: 94, leadership: 90, other: 75 },
        skills: [
          { name: 'English Debate & Eloquence', cat: 'Communication', level: 'Expert', pct: 96, exp: '3 Years', ach: 'Best Speaker - Rotary Youth Leadership Debate', cert: 'Toastmasters Youth Leadership', pass: 'Public Speaking & Inspiring Women' },
          { name: 'Student Council President / NSS Leader', cat: 'Leadership', level: 'Expert', pct: 92, exp: '2 Years', ach: 'Coordinated 500+ student charity drive' },
        ],
      },
      {
        student: students[5],
        scores: { studies: 76, sports: 92, arts: 92, technical: 65, communication: 70, leadership: 75, other: 70 }, // JOINT HIGHEST TIE (Sports 92% == Arts 92%)
        skills: [
          { name: 'Badminton (Singles)', cat: 'Sports', level: 'Expert', pct: 92, exp: '4 Years', ach: 'District Singles Runner-Up', pass: 'Athletics & Badminton' },
          { name: 'Traditional Music & Veena', cat: 'Arts & Culture', level: 'Expert', pct: 92, exp: '5 Years', ach: 'Inter-College Cultural Solo Champion', cert: 'Tamil Isai Sangam Grade 5' },
        ],
      },
      {
        student: students[6],
        scores: { studies: 91, sports: 58, arts: 62, technical: 88, communication: 80, leadership: 74, other: 65 },
        skills: [
          { name: 'Statistical Data Analysis with R', cat: 'Technical Skills', level: 'Advanced', pct: 88, exp: '1 Year', pass: 'Predictive Analytics' },
        ],
      },
      {
        student: students[7],
        scores: { studies: 88, sports: 70, arts: 65, technical: 72, communication: 85, leadership: 82, other: 70 },
        skills: [
          { name: 'Financial Model Analysis', cat: 'Studies', level: 'Advanced', pct: 88, exp: '1 Year', cert: 'NSE Financial Markets' },
        ],
      },
    ];

    for (const item of studentTalentProfiles) {
      const calc = talentService.calculateTalentScores(item.scores, item.student.name);

      await TalentScore.create({
        student: item.student._id,
        registerNumber: item.student.registerNumber,
        studentName: item.student.name,
        department: item.student.department,
        course: item.student.course,
        year: item.student.year,
        semester: item.student.semester,
        section: item.student.section,
        evaluatedBy: adminUser._id,
        evaluatorNotes: 'Comprehensive faculty talent evaluation completed.',
        ...calc,
      });

      for (const s of item.skills) {
        await Skill.create({
          student: item.student._id,
          registerNumber: item.student.registerNumber,
          skillName: s.name,
          category: s.cat === 'Studies' ? 'Studies' : s.cat,
          skillLevel: s.level,
          percentage: s.pct,
          experience: s.exp,
          achievement: s.ach || '',
          certificate: s.cert || '',
          passion: s.pass || '',
        });
      }
    }

    // 10. Log Initial Setup
    await AuditLog.create({
      action: 'SYSTEM_INITIALIZATION',
      module: 'SEED',
      performedBy: adminUser._id,
      performerName: adminUser.name,
      performerRole: 'admin',
      details: { message: 'Database initialized with Kamban College sample records.' },
    });

    console.log('✅ Kamban College Department Management Database seeded successfully!');
    console.log('================================================================');
    console.log('🔑 DEMO CREDENTIALS:');
    console.log('👑 Admin:   admin@kcas.edu.in   /  Admin@123');
    console.log('👩‍🏫 Faculty: faculty@kcas.edu.in /  Faculty@123');
    console.log('🎓 Student: student@kcas.edu.in /  Student@123');
    console.log('================================================================\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

module.exports = seedDatabase;
