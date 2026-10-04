const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const TalentScore = require('../models/TalentScore');
const Certificate = require('../models/Certificate');
const LocationAlert = require('../models/LocationAlert');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const SystemSetting = require('../models/SystemSetting');
const talentService = require('../services/talentService');

async function seedDatabase() {
  try {
    console.log('🌱 Initializing core KCAS structure...');

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
      { subjectId: 'SUB-CS-304', subjectName: 'Computer Networks', subjectCode: 'CS304', department: csDept._id, course: bscCs._id, semester: 'Semester 3', credits: 3 },
      { subjectId: 'SUB-CS-305', subjectName: 'Web Technology & Full Stack', subjectCode: 'CS305', department: csDept._id, course: bscCs._id, semester: 'Semester 3', credits: 3 },
      { subjectId: 'SUB-AI-301', subjectName: 'Machine Learning Fundamentals', subjectCode: 'AI301', department: aidsDept._id, course: bscAids._id, semester: 'Semester 3', credits: 4 },
      { subjectId: 'SUB-AI-302', subjectName: 'Applied Python & Data Visualization', subjectCode: 'AI302', department: aidsDept._id, course: bscAids._id, semester: 'Semester 3', credits: 4 },
    ];

    for (const sub of subjectsSeed) {
      const existing = await Subject.findOne({ subjectCode: sub.subjectCode });
      if (!existing) {
        await Subject.create(sub);
      }
    }

    // 4. Seed System Settings with exact location
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

    // 5. Seed Faculty
    let kanimozhiFaculty = await Faculty.findOne({ email: 'kanimozhi@kcas.edu.in' });
    if (!kanimozhiFaculty) {
      kanimozhiFaculty = await Faculty.create({
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
    }

    let saravananFaculty = await Faculty.findOne({ email: 'saravanan@kcas.edu.in' });
    if (!saravananFaculty) {
      saravananFaculty = await Faculty.create({
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
    }

    // 6. Seed Students (Vinodhini A, Varshini S, Vinisha R, Kavitha R, Abinaya M)
    const todayDate = new Date().toISOString().split('T')[0];

    // VINODHINI A
    let vinodhini = await Student.findOne({ registerNumber: '23BCS001' });
    if (!vinodhini) {
      vinodhini = await Student.create({
        studentId: 'STU-2026-001',
        registerNumber: '23BCS001',
        rollNumber: 'CS2301',
        name: 'Vinodhini A',
        dateOfBirth: '2004-05-12',
        gender: 'Female',
        email: 'vinodhini@kcas.edu.in',
        phone: '94421 99881',
        address: 'No. 14, Gandhi Nagar, Thenmathur, Tiruvannamalai - 606603',
        department: csDept._id,
        course: bscCs._id,
        year: 'II Year',
        semester: 'Semester 3',
        section: 'A',
        admissionYear: 2023,
        parentName: 'Sundaramoorthy M',
        parentPhone: '94421 99881',
        mentor: kanimozhiFaculty._id,
        mentorName: kanimozhiFaculty.name,
        initialAttendance: 94,
        initialMarks: 93,
        status: 'Active',
        talents: [
          { category: 'Sports', skillName: 'Silambam / Traditional Martial Arts', proficiency: 'Expert' },
          { category: 'Coding', skillName: 'Full Stack Web & Python', proficiency: 'Advanced' },
          { category: 'Dance', skillName: 'Classical Bharatanatyam', proficiency: 'Advanced' },
          { category: 'Communication', skillName: 'Tamil & English Oratory', proficiency: 'Advanced' },
        ],
      });
    }

    // VARSHINI S
    let varshini = await Student.findOne({ registerNumber: '23BCS002' });
    if (!varshini) {
      varshini = await Student.create({
        studentId: 'STU-2026-002',
        registerNumber: '23BCS002',
        rollNumber: 'CS2302',
        name: 'Varshini S',
        dateOfBirth: '2004-08-14',
        gender: 'Female',
        email: 'varshini@kcas.edu.in',
        phone: '98421 11223',
        address: 'No. 24, Car Street, Tiruvannamalai - 606601',
        department: csDept._id,
        course: bscCs._id,
        year: 'II Year',
        semester: 'Semester 3',
        section: 'A',
        admissionYear: 2023,
        parentName: 'Sivakumar K',
        parentPhone: '98421 11223',
        mentor: kanimozhiFaculty._id,
        mentorName: kanimozhiFaculty.name,
        initialAttendance: 91,
        initialMarks: 96,
        status: 'Active',
      });
    }

    // VINISHA R
    let vinisha = await Student.findOne({ registerNumber: '23BCS003' });
    if (!vinisha) {
      vinisha = await Student.create({
        studentId: 'STU-2026-003',
        registerNumber: '23BCS003',
        rollNumber: 'CS2303',
        name: 'Vinisha R',
        dateOfBirth: '2004-10-22',
        gender: 'Female',
        email: 'vinisha@kcas.edu.in',
        phone: '97890 33445',
        address: 'No. 5, Anna Nagar, Tiruvannamalai - 606603',
        department: csDept._id,
        course: bscCs._id,
        year: 'II Year',
        semester: 'Semester 3',
        section: 'A',
        admissionYear: 2023,
        parentName: 'Ramesh P',
        parentPhone: '97890 33445',
        mentor: kanimozhiFaculty._id,
        mentorName: kanimozhiFaculty.name,
        initialAttendance: 88,
        initialMarks: 85,
        status: 'Active',
      });
    }

    // Seed Talent Score for Vinodhini A with exact scores: Academic: 93%, Silambam: 95%, Dance: 82%, Communication: 78%, Technical: 90%
    let vinodhiniTalent = await TalentScore.findOne({ student: vinodhini._id });
    const vinodhiniCalc = talentService.calculateTalentScores(
      {
        studies: 93,
        silambam: 95,
        dance: 82,
        communication: 78,
        technical: 90,
        sports: 85,
        cultural: 75,
        leadership: 80,
        other: 70,
      },
      vinodhini.name
    );

    if (!vinodhiniTalent) {
      await TalentScore.create({
        student: vinodhini._id,
        registerNumber: vinodhini.registerNumber,
        studentName: vinodhini.name,
        department: csDept._id,
        course: bscCs._id,
        year: vinodhini.year,
        semester: vinodhini.semester,
        section: vinodhini.section,
        ...vinodhiniCalc,
      });
    } else {
      Object.assign(vinodhiniTalent, vinodhiniCalc);
      await vinodhiniTalent.save();
    }

    // Seed Talent for Varshini S
    let varshiniTalent = await TalentScore.findOne({ student: varshini._id });
    if (!varshiniTalent) {
      const varshiniCalc = talentService.calculateTalentScores(
        {
          studies: 96,
          communication: 92,
          technical: 85,
          leadership: 88,
          sports: 70,
          cultural: 80,
          silambam: 65,
          dance: 70,
          other: 75,
        },
        varshini.name
      );
      await TalentScore.create({
        student: varshini._id,
        registerNumber: varshini.registerNumber,
        studentName: varshini.name,
        department: csDept._id,
        course: bscCs._id,
        year: varshini.year,
        semester: varshini.semester,
        section: varshini.section,
        ...varshiniCalc,
      });
    }

    // Seed Marks for Vinodhini A
    const csSubjects = await Subject.find({ course: bscCs._id, semester: 'Semester 3' });
    for (const sub of csSubjects) {
      let mark = await Mark.findOne({ student: vinodhini._id, subject: sub._id });
      let score = sub.subjectCode === 'CS301' ? 88 : sub.subjectCode === 'CS302' ? 92 : sub.subjectCode === 'CS303' ? 85 : 94;
      let intM = Math.round((score * 25) / 100);
      let extM = score - intM;

      if (!mark) {
        await Mark.create({
          student: vinodhini._id,
          registerNumber: vinodhini.registerNumber,
          studentName: vinodhini.name,
          department: csDept._id,
          course: bscCs._id,
          semester: 'Semester 3',
          subject: sub._id,
          subjectCode: sub.subjectCode,
          subjectName: sub.subjectName,
          internalMark: intM,
          externalMark: extM,
          totalMark: score,
          percentage: score,
          grade: score >= 90 ? 'O' : score >= 80 ? 'A+' : score >= 70 ? 'A' : 'B',
          resultStatus: score >= 40 ? 'Pass' : 'Fail',
        });
      }
    }

    // Seed Certificates for Vinodhini A
    let cert1 = await Certificate.findOne({ title: 'State Level Silambam Championship Gold Medalist' });
    if (!cert1) {
      await Certificate.create({
        student: vinodhini._id,
        title: 'State Level Silambam Championship Gold Medalist',
        category: 'Sports',
        issuer: 'Tamil Nadu Traditional Silambam Federation',
        issueDate: '2025-08-10',
        verificationStatus: 'Verified',
        description: 'First prize gold medal in traditional weapon rotation & sparring championship.',
      });
    }

    let cert2 = await Certificate.findOne({ title: 'Full Stack Cloud Developer Professional Certification' });
    if (!cert2) {
      await Certificate.create({
        student: vinodhini._id,
        title: 'Full Stack Cloud Developer Professional Certification',
        category: 'Technical',
        issuer: 'NPTEL / IIT Madras',
        issueDate: '2025-11-20',
        verificationStatus: 'Verified',
        description: 'Elite + Gold certification in Modern Web Architecture & Full Stack Cloud Systems.',
      });
    }

    // Seed Events
    let ev1 = await Event.findOne({ title: 'National Conference on Generative AI & Computing Innovations' });
    if (!ev1) {
      await Event.create({
        title: 'National Conference on Generative AI & Computing Innovations',
        type: 'Symposium',
        description: 'National symposium showcasing student research papers, intelligent agents, and full-stack computing systems.',
        department: csDept._id,
        eventDate: '2026-10-15',
        startTime: '09:30 AM',
        endTime: '04:30 PM',
        venue: 'Kamban Golden Jubilee Auditorium',
        organizer: 'Department of Computer Science',
        coordinator: kanimozhiFaculty._id,
        maxParticipants: 250,
        status: 'Upcoming',
        participants: [
          {
            student: vinodhini._id,
            studentName: vinodhini.name,
            registerNumber: vinodhini.registerNumber,
            departmentName: 'Department of Computer Science',
            status: 'Registered',
          },
        ],
      });
    }

    let ev2 = await Event.findOne({ title: 'Inter-College State Silambam & Martial Arts Meet' });
    if (!ev2) {
      await Event.create({
        title: 'Inter-College State Silambam & Martial Arts Meet',
        type: 'Sports',
        description: 'Statewide martial arts demonstration and tournament for women collegiate athletes.',
        department: csDept._id,
        eventDate: '2026-09-10',
        startTime: '08:30 AM',
        endTime: '05:00 PM',
        venue: 'Kamban Sports Pavilion',
        organizer: 'Physical Education & Traditional Arts Council',
        status: 'Completed',
        participants: [
          {
            student: vinodhini._id,
            studentName: vinodhini.name,
            registerNumber: vinodhini.registerNumber,
            departmentName: 'Department of Computer Science',
            status: 'Attended',
          },
        ],
      });
    }

    // Seed Notices
    let not1 = await Notice.findOne({ title: 'Thiruvalluvar University Semester Examination Schedule' });
    if (!not1) {
      await Notice.create({
        title: 'Thiruvalluvar University Semester Examination Schedule',
        content: 'All second year and final year students are requested to verify their nominal roll and Hall Tickets for upcoming University Examinations.',
        department: csDept._id,
        priority: 'High',
        publishDate: todayDate,
        expiryDate: '2026-11-30',
        status: 'Active',
      });
    }

    // Seed Today's Attendance Sheet
    let todayAtt = await Attendance.findOne({ date: todayDate, department: csDept._id, course: bscCs._id });
    if (!todayAtt) {
      await Attendance.create({
        department: csDept._id,
        course: bscCs._id,
        year: 'II Year',
        semester: 'Semester 3',
        section: 'A',
        subject: csSubjects[0]._id,
        date: todayDate,
        totalStudents: 3,
        presentCount: 3,
        absentCount: 0,
        records: [
          {
            student: vinodhini._id,
            registerNumber: vinodhini.registerNumber,
            status: 'Present',
            isGeoVerified: true,
            verificationMethod: 'GPS_CAMPUS',
            checkInTime: '09:05 AM',
            geoCoordinates: { latitude: 12.1905865, longitude: 79.0837848, distanceMeters: 120 },
          },
          {
            student: varshini._id,
            registerNumber: varshini.registerNumber,
            status: 'Present',
            isGeoVerified: true,
            verificationMethod: 'GPS_CAMPUS',
            checkInTime: '09:10 AM',
            geoCoordinates: { latitude: 12.1905865, longitude: 79.0837848, distanceMeters: 240 },
          },
          {
            student: vinisha._id,
            registerNumber: vinisha.registerNumber,
            status: 'Present',
            isGeoVerified: true,
            verificationMethod: 'MANUAL_FACULTY',
            checkInTime: '09:12 AM',
          },
        ],
      });
    }

    console.log('✅ Real KCAS Data Seeding completed successfully.');
    return true;
  } catch (err) {
    console.error('❌ Error during data seeding:', err.message);
  }
}

module.exports = seedDatabase;
