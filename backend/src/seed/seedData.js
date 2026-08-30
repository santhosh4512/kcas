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

// Helper to upsert User idempotently and safely
async function upsertUser(userData) {
  const email = userData.email.trim().toLowerCase();
  let user = await User.findOne({ email }).select('+password');

  if (!user) {
    user = await User.create({
      ...userData,
      email,
    });
  } else {
    let hasChanges = false;
    if (userData.name && user.name !== userData.name) {
      user.name = userData.name;
      hasChanges = true;
    }
    if (userData.role && user.role !== userData.role) {
      user.role = userData.role;
      hasChanges = true;
    }
    if (userData.status && user.status !== userData.status) {
      user.status = userData.status;
      hasChanges = true;
    }
    if (userData.department && String(user.department) !== String(userData.department)) {
      user.department = userData.department;
      hasChanges = true;
    }
    if (userData.designation && user.designation !== userData.designation) {
      user.designation = userData.designation;
      hasChanges = true;
    }
    if (userData.employeeId && user.employeeId !== userData.employeeId) {
      user.employeeId = userData.employeeId;
      hasChanges = true;
    }
    if (userData.permissions && JSON.stringify(user.permissions) !== JSON.stringify(userData.permissions)) {
      user.permissions = userData.permissions;
      hasChanges = true;
    }
    if (userData.referenceId && String(user.referenceId) !== String(userData.referenceId)) {
      user.referenceId = userData.referenceId;
      hasChanges = true;
    }
    if (userData.roleRefModel && user.roleRefModel !== userData.roleRefModel) {
      user.roleRefModel = userData.roleRefModel;
      hasChanges = true;
    }
    if (userData.phone && user.phone !== userData.phone) {
      user.phone = userData.phone;
      hasChanges = true;
    }
    if (userData.profilePhoto && user.profilePhoto !== userData.profilePhoto) {
      user.profilePhoto = userData.profilePhoto;
      hasChanges = true;
    }
    if (userData.avatar && user.avatar !== userData.avatar) {
      user.avatar = userData.avatar;
      hasChanges = true;
    }

    if (userData.password) {
      const isMatch = await user.comparePassword(userData.password);
      if (!isMatch) {
        user.password = userData.password;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await user.save();
    }
  }
  return user;
}

// Helper to upsert Department idempotently
async function upsertDepartment(data) {
  let dept = await Department.findOne({
    $or: [{ code: data.code }, { departmentId: data.departmentId }],
  });
  if (!dept) {
    dept = await Department.create(data);
  } else {
    dept.name = data.name || dept.name;
    dept.hod = data.hod || dept.hod;
    dept.description = data.description || dept.description;
    dept.status = data.status || dept.status;
    await dept.save();
  }
  return dept;
}

// Helper to upsert Course idempotently
async function upsertCourse(data) {
  let course = await Course.findOne({
    $or: [{ courseCode: data.courseCode }, { courseId: data.courseId }],
  });
  if (!course) {
    course = await Course.create(data);
  } else {
    course.courseName = data.courseName || course.courseName;
    course.department = data.department || course.department;
    course.duration = data.duration || course.duration;
    course.courseType = data.courseType || course.courseType;
    course.status = data.status || course.status;
    await course.save();
  }
  return course;
}

// Helper to upsert Faculty idempotently
async function upsertFaculty(data) {
  const email = data.email.trim().toLowerCase();
  let fac = await Faculty.findOne({
    $or: [{ employeeId: data.employeeId }, { email }],
  });
  if (!fac) {
    fac = await Faculty.create({ ...data, email });
  } else {
    fac.name = data.name || fac.name;
    fac.qualification = data.qualification || fac.qualification;
    fac.designation = data.designation || fac.designation;
    fac.department = data.department || fac.department;
    fac.phone = data.phone || fac.phone;
    fac.experience = data.experience || fac.experience;
    fac.specialization = data.specialization || fac.specialization;
    fac.status = data.status || fac.status;
    if (data.profilePhoto) fac.profilePhoto = data.profilePhoto;
    await fac.save();
  }
  return fac;
}

// Helper to upsert Subject idempotently
async function upsertSubject(data) {
  let sub = await Subject.findOne({
    $or: [{ subjectCode: data.subjectCode }, { subjectId: data.subjectId }],
  });
  if (!sub) {
    sub = await Subject.create(data);
  } else {
    sub.subjectName = data.subjectName || sub.subjectName;
    sub.course = data.course || sub.course;
    sub.department = data.department || sub.department;
    sub.semester = data.semester || sub.semester;
    sub.credits = data.credits || sub.credits;
    sub.faculty = data.faculty || sub.faculty;
    sub.status = data.status || sub.status;
    await sub.save();
  }
  return sub;
}

// Helper to upsert Student idempotently
async function upsertStudent(data) {
  const email = data.email.trim().toLowerCase();
  let stud = await Student.findOne({
    $or: [{ registerNumber: data.registerNumber }, { studentId: data.studentId }, { email }],
  });
  if (!stud) {
    stud = await Student.create({ ...data, email });
  } else {
    stud.name = data.name || stud.name;
    stud.rollNumber = data.rollNumber || stud.rollNumber;
    stud.gender = data.gender || stud.gender;
    stud.dob = data.dob || stud.dob;
    stud.phone = data.phone || stud.phone;
    stud.address = data.address || stud.address;
    stud.department = data.department || stud.department;
    stud.course = data.course || stud.course;
    stud.year = data.year || stud.year;
    stud.semester = data.semester || stud.semester;
    stud.section = data.section || stud.section;
    stud.parentName = data.parentName || stud.parentName;
    stud.parentPhone = data.parentPhone || stud.parentPhone;
    stud.status = data.status || stud.status;
    if (data.photoUrl) stud.photoUrl = data.photoUrl;
    if (data.profilePhoto) stud.profilePhoto = data.profilePhoto;
    await stud.save();
  }
  return stud;
}

async function seedDatabase() {
  try {
    console.log('🌱 Initializing/Verifying KCAS institutional database records...');

    // 1. Seed Core Administrators (Idempotent)
    await upsertUser({
      name: 'Santhosh Siva (System Administrator)',
      email: 'santhoshsiva754@gmail.com',
      password: '12345678',
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
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    });

    await upsertUser({
      name: 'Dr. S. Meenakshi (Principal & Admin)',
      email: 'admin@kcas.edu.in',
      password: 'Admin@123',
      role: 'admin',
      status: 'Active',
      mustChangePassword: false,
    });

    // 2. Upsert Departments
    const csDept = await upsertDepartment({
      departmentId: 'DEPT-CS',
      name: 'B.Sc Computer Science',
      code: 'CS',
      hod: 'Dr. K. Anitha',
      description: 'Department of Computer Science focusing on Modern Computing, AI, and Software Engineering.',
      status: 'Active',
    });

    const dsDept = await upsertDepartment({
      departmentId: 'DEPT-DS',
      name: 'B.Sc Data Science',
      code: 'DS',
      hod: 'Dr. R. Kavitha',
      description: 'Advanced data analytics, machine learning, and statistical computing for women in STEM.',
      status: 'Active',
    });

    const comDept = await upsertDepartment({
      departmentId: 'DEPT-COM',
      name: 'B.Com (General & Corporate)',
      code: 'COM',
      hod: 'Dr. M. Soundarya',
      description: 'Commerce and Business Administration, Banking, Finance, and Corporate Accounting.',
      status: 'Active',
    });

    const engDept = await upsertDepartment({
      departmentId: 'DEPT-ENG',
      name: 'B.A English Literature',
      code: 'ENG',
      hod: 'Mrs. V. Jayanthi',
      description: 'Department of English Language, World Literature, Phonetics, and Soft Skills.',
      status: 'Active',
    });

    const chemDept = await upsertDepartment({
      departmentId: 'DEPT-CHEM',
      name: 'B.Sc Chemistry',
      code: 'CHEM',
      hod: 'Dr. P. Revathi',
      description: 'Organic, Inorganic and Analytical Chemistry with advanced laboratory research.',
      status: 'Active',
    });

    // 3. Upsert Courses
    const bscCsCourse = await upsertCourse({
      courseId: 'CRS-BSC-CS',
      courseName: 'Bachelor of Science in Computer Science',
      courseCode: 'BSC-CS',
      department: csDept._id,
      duration: '3 Years (6 Semesters)',
      courseType: 'Undergraduate (UG)',
      status: 'Active',
    });

    const mscCsCourse = await upsertCourse({
      courseId: 'CRS-MSC-CS',
      courseName: 'Master of Science in Computer Science',
      courseCode: 'MSC-CS',
      department: csDept._id,
      duration: '2 Years (4 Semesters)',
      courseType: 'Postgraduate (PG)',
      status: 'Active',
    });

    const bscDsCourse = await upsertCourse({
      courseId: 'CRS-BSC-DS',
      courseName: 'Bachelor of Science in Data Science',
      courseCode: 'BSC-DS',
      department: dsDept._id,
      duration: '3 Years (6 Semesters)',
      courseType: 'Undergraduate (UG)',
      status: 'Active',
    });

    const bcomCourse = await upsertCourse({
      courseId: 'CRS-BCOM',
      courseName: 'Bachelor of Commerce',
      courseCode: 'BCOM',
      department: comDept._id,
      duration: '3 Years (6 Semesters)',
      courseType: 'Undergraduate (UG)',
      status: 'Active',
    });

    const baEngCourse = await upsertCourse({
      courseId: 'CRS-BA-ENG',
      courseName: 'Bachelor of Arts in English',
      courseCode: 'BA-ENG',
      department: engDept._id,
      duration: '3 Years (6 Semesters)',
      courseType: 'Undergraduate (UG)',
      status: 'Active',
    });

    // 4. Upsert Faculty Members
    const facAnitha = await upsertFaculty({
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
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    });

    const demoFaculty = await upsertFaculty({
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
      profilePhoto: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80',
    });

    const facKavitha = await upsertFaculty({
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
      profilePhoto: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
    });

    const facSoundarya = await upsertFaculty({
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
      profilePhoto: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80',
    });

    // Link demo faculty login account idempotently
    await upsertUser({
      name: 'Mrs. M. Saranya (Assistant Professor)',
      email: 'faculty@kcas.edu.in',
      password: 'Faculty@123',
      role: 'faculty',
      department: csDept._id,
      referenceId: demoFaculty._id,
      roleRefModel: 'Faculty',
      designation: 'Assistant Professor',
      employeeId: 'EMP102',
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
      profilePhoto: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80',
      avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80',
    });

    // 5. Upsert Subjects
    const pySubject = await upsertSubject({
      subjectId: 'SUB-CS101',
      subjectCode: 'CS101',
      subjectName: 'Python Programming & Problem Solving',
      course: bscCsCourse._id,
      department: csDept._id,
      semester: 'Semester 1',
      credits: 4,
      faculty: demoFaculty._id,
      status: 'Active',
    });

    const dsSubject = await upsertSubject({
      subjectId: 'SUB-CS102',
      subjectCode: 'CS102',
      subjectName: 'Data Structures and Algorithms',
      course: bscCsCourse._id,
      department: csDept._id,
      semester: 'Semester 1',
      credits: 4,
      faculty: facAnitha._id,
      status: 'Active',
    });

    const dbSubject = await upsertSubject({
      subjectId: 'SUB-CS103',
      subjectCode: 'CS103',
      subjectName: 'Database Management Systems (DBMS)',
      course: bscCsCourse._id,
      department: csDept._id,
      semester: 'Semester 1',
      credits: 4,
      faculty: facAnitha._id,
      status: 'Active',
    });

    const dsStatsSubject = await upsertSubject({
      subjectId: 'SUB-DS101',
      subjectCode: 'DS101',
      subjectName: 'Foundations of Data Science & Statistics',
      course: bscDsCourse._id,
      department: dsDept._id,
      semester: 'Semester 1',
      credits: 4,
      faculty: facKavitha._id,
      status: 'Active',
    });

    const comAccSubject = await upsertSubject({
      subjectId: 'SUB-COM101',
      subjectCode: 'COM101',
      subjectName: 'Financial Accounting & Reporting',
      course: bcomCourse._id,
      department: comDept._id,
      semester: 'Semester 1',
      credits: 4,
      faculty: facSoundarya._id,
      status: 'Active',
    });

    // 6. Upsert Students
    const studKanimozhi = await upsertStudent({
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
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    });

    const studVinodhini = await upsertStudent({
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
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    });

    const studPavithra = await upsertStudent({
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
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    });

    const studKeerthana = await upsertStudent({
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
      photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
      profilePhoto: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    });

    const studDeepika = await upsertStudent({
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
      photoUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80',
      profilePhoto: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80',
    });

    const studSangeetha = await upsertStudent({
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
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    });

    const studAbinaya = await upsertStudent({
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
      parentName: 'Balasubramaniam K',
      parentPhone: '9443322107',
      status: 'Active',
      photoUrl: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?w=400&auto=format&fit=crop&q=80',
      profilePhoto: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?w=400&auto=format&fit=crop&q=80',
    });

    const studMonika = await upsertStudent({
      studentId: 'STU-24UBC001',
      registerNumber: '24UBC001',
      rollNumber: 'COM2401',
      name: 'Monika E',
      gender: 'Female',
      dob: '2005-08-25',
      email: 'monika.com@kcas.edu.in',
      phone: '9876543208',
      address: 'Manalurpet Road, Tiruvannamalai',
      department: comDept._id,
      course: bcomCourse._id,
      year: 'I Year',
      semester: 'Semester 1',
      section: 'A',
      parentName: 'Elangovan R',
      parentPhone: '9443322108',
      status: 'Active',
      photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
      profilePhoto: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
    });

    // Link demo student login account idempotently
    await upsertUser({
      name: 'Pavithra D (Student)',
      email: 'student@kcas.edu.in',
      password: 'Student@123',
      role: 'student',
      department: csDept._id,
      referenceId: studPavithra._id,
      roleRefModel: 'Student',
      status: 'Active',
      mustChangePassword: false,
      permissions: [],
      profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    });

    // 7. Seed Marks & Results (Idempotent upsert)
    const marksData = [
      // Kanimozhi (Top Academic)
      { student: studKanimozhi._id, subject: pySubject._id, department: csDept._id, semester: 'Semester 1', internalMarks: 24, externalMarks: 72 },
      { student: studKanimozhi._id, subject: dsSubject._id, department: csDept._id, semester: 'Semester 1', internalMarks: 25, externalMarks: 70 },
      { student: studKanimozhi._id, subject: dbSubject._id, department: csDept._id, semester: 'Semester 1', internalMarks: 23, externalMarks: 68 },
      // Vinodhini (Sports Champion)
      { student: studVinodhini._id, subject: pySubject._id, department: csDept._id, semester: 'Semester 1', internalMarks: 20, externalMarks: 60 },
      { student: studVinodhini._id, subject: dsSubject._id, department: csDept._id, semester: 'Semester 1', internalMarks: 19, externalMarks: 58 },
      { student: studVinodhini._id, subject: dbSubject._id, department: csDept._id, semester: 'Semester 1', internalMarks: 21, externalMarks: 62 },
      // Pavithra (Technical Web Dev)
      { student: studPavithra._id, subject: pySubject._id, department: csDept._id, semester: 'Semester 1', internalMarks: 23, externalMarks: 68 },
      { student: studPavithra._id, subject: dsSubject._id, department: csDept._id, semester: 'Semester 1', internalMarks: 22, externalMarks: 65 },
      { student: studPavithra._id, subject: dbSubject._id, department: csDept._id, semester: 'Semester 1', internalMarks: 24, externalMarks: 67 },
      // Keerthana (Arts)
      { student: studKeerthana._id, subject: pySubject._id, department: csDept._id, semester: 'Semester 1', internalMarks: 21, externalMarks: 63 },
      { student: studKeerthana._id, subject: dsSubject._id, department: csDept._id, semester: 'Semester 1', internalMarks: 20, externalMarks: 61 },
      // Deepika (Debate)
      { student: studDeepika._id, subject: pySubject._id, department: csDept._id, semester: 'Semester 1', internalMarks: 22, externalMarks: 64 },
      // Sangeetha (Tied)
      { student: studSangeetha._id, subject: pySubject._id, department: csDept._id, semester: 'Semester 1', internalMarks: 22, externalMarks: 66 },
      // Abinaya (Data Science)
      { student: studAbinaya._id, subject: dsStatsSubject._id, department: dsDept._id, semester: 'Semester 1', internalMarks: 24, externalMarks: 70 },
      // Monika (Commerce)
      { student: studMonika._id, subject: comAccSubject._id, department: comDept._id, semester: 'Semester 1', internalMarks: 23, externalMarks: 69 },
    ];

    for (const m of marksData) {
      const total = m.internalMarks + m.externalMarks;
      let grade = 'RA';
      let gradePoints = 0;
      let isPassed = false;
      if (m.internalMarks >= 10 && m.externalMarks >= 30 && total >= 40) {
        isPassed = true;
        if (total >= 90) { grade = 'O'; gradePoints = 10; }
        else if (total >= 80) { grade = 'A+'; gradePoints = 9; }
        else if (total >= 70) { grade = 'A'; gradePoints = 8; }
        else if (total >= 60) { grade = 'B+'; gradePoints = 7; }
        else if (total >= 50) { grade = 'B'; gradePoints = 6; }
        else { grade = 'C'; gradePoints = 5; }
      }

      await Mark.findOneAndUpdate(
        { student: m.student, subject: m.subject, semester: m.semester },
        {
          ...m,
          totalMarks: total,
          grade,
          gradePoints,
          isPassed,
          evaluationStatus: 'Submitted',
          evaluatedBy: demoFaculty._id,
        },
        { upsert: true, new: true }
      );
    }

    // 8. Seed Skills & Talent Intelligence (Idempotent upsert)
    const skillsData = [
      // Kanimozhi (Academic excellence)
      { student: studKanimozhi._id, registerNumber: studKanimozhi.registerNumber, category: 'Studies', skillName: 'Top Scorer in University Model Exams', skillLevel: 'Advanced', percentage: 94 },
      { student: studKanimozhi._id, registerNumber: studKanimozhi.registerNumber, category: 'Technical Skills', skillName: 'Python Algorithms Certification', skillLevel: 'Intermediate', percentage: 76 },
      // Vinodhini (Sports Silambam)
      { student: studVinodhini._id, registerNumber: studVinodhini.registerNumber, category: 'Sports', skillName: 'State Level Silambam Gold Medalist', skillLevel: 'Master', percentage: 95 },
      { student: studVinodhini._id, registerNumber: studVinodhini.registerNumber, category: 'Sports', skillName: 'District Athletics 100m Sprinter', skillLevel: 'Advanced', percentage: 88 },
      // Pavithra (Technical Full Stack)
      { student: studPavithra._id, registerNumber: studPavithra.registerNumber, category: 'Technical Skills', skillName: 'Full Stack React & Node.js Developer', skillLevel: 'Master', percentage: 92 },
      { student: studPavithra._id, registerNumber: studPavithra.registerNumber, category: 'Technical Skills', skillName: 'Smart India Hackathon Finalist', skillLevel: 'Advanced', percentage: 89 },
      // Keerthana (Arts & Bharatanatyam)
      { student: studKeerthana._id, registerNumber: studKeerthana.registerNumber, category: 'Arts & Culture', skillName: 'Bharatanatyam Arangetram Certified', skillLevel: 'Master', percentage: 93 },
      // Deepika (Debate / Leadership)
      { student: studDeepika._id, registerNumber: studDeepika.registerNumber, category: 'Communication', skillName: 'Inter-Collegiate Tamil Debate Winner', skillLevel: 'Master', percentage: 92 },
      { student: studDeepika._id, registerNumber: studDeepika.registerNumber, category: 'Leadership', skillName: 'College Student Union Vice President', skillLevel: 'Advanced', percentage: 88 },
      // Sangeetha (Tied Sports & Arts)
      { student: studSangeetha._id, registerNumber: studSangeetha.registerNumber, category: 'Sports', skillName: 'State Volleyball Team Captain', skillLevel: 'Master', percentage: 92 },
      { student: studSangeetha._id, registerNumber: studSangeetha.registerNumber, category: 'Arts & Culture', skillName: 'Carnatic Classical Vocalist Award', skillLevel: 'Master', percentage: 92 },
    ];

    for (const sk of skillsData) {
      await Skill.findOneAndUpdate(
        { student: sk.student, skillName: sk.skillName },
        { ...sk, achievement: 'Institutional verified skill certification.' },
        { upsert: true, new: true }
      );
    }

    // 9. Recompute Talent Scores idempotently
    const studentTalentMap = [
      { student: studKanimozhi, scores: { studies: 94, sports: 65, arts: 70, technical: 76, communication: 82, leadership: 75, other: 60 } },
      { student: studVinodhini, scores: { studies: 72, sports: 95, arts: 68, technical: 65, communication: 78, leadership: 85, other: 70 } },
      { student: studPavithra, scores: { studies: 85, sports: 60, arts: 65, technical: 92, communication: 80, leadership: 78, other: 75 } },
      { student: studKeerthana, scores: { studies: 78, sports: 62, arts: 93, technical: 60, communication: 84, leadership: 75, other: 70 } },
      { student: studDeepika, scores: { studies: 82, sports: 65, arts: 75, technical: 68, communication: 92, leadership: 88, other: 70 } },
      { student: studSangeetha, scores: { studies: 80, sports: 92, arts: 92, technical: 70, communication: 85, leadership: 78, other: 65 } },
      { student: studAbinaya, scores: { studies: 88, sports: 65, arts: 70, technical: 86, communication: 78, leadership: 75, other: 65 } },
      { student: studMonika, scores: { studies: 86, sports: 68, arts: 72, technical: 74, communication: 80, leadership: 76, other: 68 } },
    ];

    for (const item of studentTalentMap) {
      const calculated = talentService.calculateTalentScores(item.scores, item.student.name);
      await TalentScore.findOneAndUpdate(
        { student: item.student._id },
        {
          student: item.student._id,
          registerNumber: item.student.registerNumber,
          studentName: item.student.name,
          department: item.student.department,
          course: item.student.course,
          year: item.student.year,
          semester: item.student.semester,
          section: item.student.section,
          evaluatorNotes: 'Evaluated by KCAS Institutional Faculty.',
          evaluatedBy: demoFaculty._id,
          ...calculated,
        },
        { upsert: true, new: true }
      );
    }

    console.log('✅ Institutional database verification & seeding completed successfully.');
  } catch (err) {
    console.error('❌ Error during institutional seeding:', err.message);
    throw err;
  }
}

module.exports = seedDatabase;
