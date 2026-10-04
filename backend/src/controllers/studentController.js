const Student = require('../models/Student');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const TalentScore = require('../models/TalentScore');
const Skill = require('../models/Skill');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const excelService = require('../services/excelService');
const talentService = require('../services/talentService');
const XLSX = require('xlsx');

// Helper to resolve student record for the authenticated user
async function resolveStudent(req) {
  if (req.user.referenceId) {
    const s = await Student.findById(req.user.referenceId)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode duration')
      .populate('mentor', 'name email designation phone');
    if (s) return s;
  }
  const byEmail = await Student.findOne({ email: req.user.email })
    .populate('department', 'name code')
    .populate('course', 'courseName courseCode duration')
    .populate('mentor', 'name email designation phone');
  return byEmail;
}

/**
 * @desc    Get current authenticated student's full 360 profile
 * @route   GET /api/students/me
 * @access  Private (Student)
 */
exports.getStudentMe = async (req, res, next) => {
  try {
    const student = await resolveStudent(req);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record associated with this account was not found.',
      });
    }

    // 1. Fetch Marks
    const marks = await Mark.find({ student: student._id }).populate('subject', 'subjectName subjectCode credits');
    let academicAverage = student.initialMarks || 0;
    if (marks.length > 0) {
      const sum = marks.reduce((acc, m) => acc + (m.totalMark || 0), 0);
      academicAverage = Math.round((sum / marks.length) * 10) / 10;
    }

    // 2. Fetch Attendance
    const allAttendance = await Attendance.find({ 'records.student': student._id });
    let totalWorkingDays = allAttendance.length;
    let presentDays = 0;
    allAttendance.forEach((att) => {
      const rec = att.records.find((r) => String(r.student) === String(student._id));
      if (rec && (rec.status === 'Present' || rec.status === 'On Duty')) {
        presentDays++;
      }
    });

    let attendancePercentage = student.initialAttendance || 85;
    if (totalWorkingDays > 0) {
      attendancePercentage = Math.round((presentDays / totalWorkingDays) * 1000) / 10;
    }

    // 3. Fetch Talent Scores & Auto-Sync
    let talent = await TalentScore.findOne({ student: student._id });
    if (!talent) {
      const calculated = talentService.calculateTalentScores(
        {
          studies: academicAverage || 75,
          silambam: 95,
          technical: student.skills?.length ? 90 : 75,
          sports: 85,
          dance: 80,
          cultural: 75,
          communication: 80,
          leadership: 78,
          other: 70,
        },
        student.name
      );

      talent = await TalentScore.create({
        student: student._id,
        registerNumber: student.registerNumber,
        studentName: student.name,
        department: student.department ? student.department._id : null,
        course: student.course ? student.course._id : null,
        year: student.year,
        semester: student.semester,
        section: student.section,
        ...calculated,
      });
    }

    // 4. Fetch Skills
    const skills = await Skill.find({ student: student._id });

    res.status(200).json({
      success: true,
      data: {
        student,
        academic: {
          marks,
          academicAverage,
          totalSubjects: marks.length,
          passedCount: marks.filter((m) => m.resultStatus === 'Pass').length,
        },
        attendance: {
          totalWorkingDays: totalWorkingDays || 30,
          presentDays: presentDays || Math.round((attendancePercentage * 30) / 100),
          attendancePercentage,
          status: attendancePercentage >= 75 ? 'Healthy' : attendancePercentage >= 65 ? 'Warning' : 'Low',
        },
        talent: talent || null,
        skills,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get students with multi-criteria filters & pagination
 * @route   GET /api/students
 * @access  Private
 */
exports.getStudents = async (req, res, next) => {
  try {
    // Privacy Rule: If student role makes this call, return ONLY own student record
    if (req.user.role === 'student') {
      const student = await resolveStudent(req);
      if (!student) {
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          totalPages: 0,
          currentPage: 1,
          data: [],
        });
      }
      const talent = await TalentScore.findOne({ student: student._id });
      return res.status(200).json({
        success: true,
        count: 1,
        total: 1,
        totalPages: 1,
        currentPage: 1,
        data: [{ ...student.toObject(), talentScore: talent || null }],
      });
    }

    // Faculty & Admin: full student roster
    const {
      department,
      course,
      year,
      semester,
      section,
      status,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (department && department !== 'All') query.department = department;
    if (course && course !== 'All') query.course = course;
    if (year && year !== 'All') query.year = year;
    if (semester && semester !== 'All') query.semester = semester;
    if (section && section !== 'All') query.section = section;
    if (status && status !== 'All') query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registerNumber: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { mentorName: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode duration')
      .populate('mentor', 'name email designation phone')
      .sort({ registerNumber: 1 })
      .skip(skip)
      .limit(limitNum);

    // Attach talent snapshot if exists
    const enrichedStudents = await Promise.all(
      students.map(async (st) => {
        const talent = await TalentScore.findOne({ student: st._id }).select(
          'dominantCategoryName highestScore primaryTalent secondaryStrength isJointHighest categoryScores'
        );
        return {
          ...st.toObject(),
          talentScore: talent || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedStudents.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: enrichedStudents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get complete student 360 profile (Details, Marks, Attendance, Skills, Talent)
 * @route   GET /api/students/:id
 * @access  Private
 */
exports.getStudentProfile = async (req, res, next) => {
  try {
    // Privacy Rule: If student role, prevent unauthorized ID access
    if (req.user.role === 'student') {
      const myStudent = await resolveStudent(req);
      if (!myStudent || String(myStudent._id) !== String(req.params.id)) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You are not authorized to view another student’s profile.',
        });
      }
    }

    const student = await Student.findById(req.params.id)
      .populate('department', 'name code hod')
      .populate('course', 'courseName courseCode duration courseType')
      .populate('mentor', 'name email designation phone');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // 1. Fetch Marks
    const marks = await Mark.find({ student: student._id }).populate('subject', 'subjectName subjectCode credits');

    let academicAverage = student.initialMarks || 0;
    if (marks.length > 0) {
      const sum = marks.reduce((acc, m) => acc + (m.totalMark || 0), 0);
      academicAverage = Math.round((sum / marks.length) * 10) / 10;
    }

    // 2. Fetch Attendance
    const allAttendance = await Attendance.find({
      'records.student': student._id,
    });

    let totalWorkingDays = allAttendance.length;
    let presentDays = 0;
    allAttendance.forEach((att) => {
      const rec = att.records.find((r) => String(r.student) === String(student._id));
      if (rec && (rec.status === 'Present' || rec.status === 'On Duty')) {
        presentDays++;
      }
    });

    let attendancePercentage = student.initialAttendance || 85;
    if (totalWorkingDays > 0) {
      attendancePercentage = Math.round((presentDays / totalWorkingDays) * 1000) / 10;
    }

    // 3. Fetch Talent Scores & Auto-Sync
    let talent = await TalentScore.findOne({ student: student._id });
    if (!talent) {
      const technicalScore = student.skills && student.skills.length > 0 ? 88 : 70;
      const sportsScore = student.achievements && student.achievements.length > 0 ? 85 : 70;
      const leadershipScore = student.activities && student.activities.length > 0 ? 82 : 72;

      const calculated = talentService.calculateTalentScores(
        {
          studies: academicAverage || 75,
          technical: technicalScore,
          sports: sportsScore,
          leadership: leadershipScore,
          communication: 80,
          cultural: 75,
        },
        student.name
      );

      talent = await TalentScore.create({
        student: student._id,
        registerNumber: student.registerNumber,
        studentName: student.name,
        department: student.department ? student.department._id : null,
        course: student.course ? student.course._id : null,
        year: student.year,
        semester: student.semester,
        section: student.section,
        ...calculated,
      });
    }

    // 4. Fetch Skills
    const skills = await Skill.find({ student: student._id });

    res.status(200).json({
      success: true,
      data: {
        student,
        academic: {
          marks,
          academicAverage,
          totalSubjects: marks.length,
          passedCount: marks.filter((m) => m.resultStatus === 'Pass').length,
        },
        attendance: {
          totalWorkingDays: totalWorkingDays || 30,
          presentDays: presentDays || Math.round((attendancePercentage * 30) / 100),
          attendancePercentage,
          status: attendancePercentage >= 75 ? 'Healthy' : attendancePercentage >= 65 ? 'Warning' : 'Low',
        },
        talent: talent || null,
        skills,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create single student
 * @route   POST /api/students
 * @access  Private/Admin/Faculty
 */
exports.createStudent = async (req, res, next) => {
  try {
    const {
      registerNumber,
      rollNumber,
      name,
      dob,
      gender,
      email,
      phone,
      address,
      department,
      course,
      year,
      semester,
      section,
      parentName,
      parentPhone,
      mentorName,
      initialAttendance,
      initialMarks,
      skills,
      achievements,
      activities,
      photoUrl,
      status,
      createAccount = true,
    } = req.body;

    const cleanReg = registerNumber.toUpperCase().trim();
    const cleanEmail = (email || `${cleanReg.toLowerCase()}@kcas.edu.in`).toLowerCase().trim();

    const existing = await Student.findOne({
      $or: [{ registerNumber: cleanReg }, { email: cleanEmail }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Student with this Register Number or Email already exists.',
      });
    }

    let mentorId = null;
    if (mentorName && mentorName.trim()) {
      let faculty = await Faculty.findOne({ name: { $regex: `^${mentorName.trim()}$`, $options: 'i' } });
      if (!faculty) {
        const empCode = `FAC-${Math.floor(100 + Math.random() * 900)}`;
        const facEmail = `${mentorName.toLowerCase().replace(/[^a-z0-9]/g, '')}@kcas.edu.in`;
        faculty = await Faculty.create({
          facultyId: empCode,
          employeeId: empCode,
          name: mentorName.trim(),
          email: facEmail,
          department,
          designation: 'Faculty Mentor',
          qualification: 'M.Sc., M.Phil., Ph.D.',
          status: 'Active',
        });
      }
      mentorId = faculty._id;
    }

    const student = await Student.create({
      studentId: `STU-${cleanReg}`,
      registerNumber: cleanReg,
      rollNumber: rollNumber ? rollNumber.toUpperCase().trim() : cleanReg,
      name: name.trim(),
      dob: dob || '2004-01-01',
      gender: gender || 'Female',
      email: cleanEmail,
      phone: phone || '',
      address: address || 'Tiruvannamalai, Tamil Nadu',
      department,
      course,
      year: year || 'I Year',
      semester: semester || 'Semester 1',
      section: section || 'A',
      parentName: parentName || '',
      parentPhone: parentPhone || '',
      mentor: mentorId,
      mentorName: mentorName || '',
      initialAttendance: initialAttendance || 85,
      initialMarks: initialMarks || 75,
      skills: Array.isArray(skills) ? skills : [],
      achievements: Array.isArray(achievements) ? achievements : [],
      activities: Array.isArray(activities) ? activities : [],
      photoUrl: photoUrl || '',
      status: status || 'Active',
    });

    // Create student user account
    if (createAccount) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (!existingUser) {
        await User.create({
          name: student.name,
          email: student.email,
          password: 'Student@123',
          role: 'student',
          department: student.department,
          referenceId: student._id,
          roleRefModel: 'Student',
        });
      }
    }

    // Initialize talent profile
    const calc = talentService.calculateTalentScores(
      {
        studies: student.initialMarks || 75,
        technical: student.skills.length > 0 ? 88 : 70,
        sports: student.achievements.length > 0 ? 85 : 70,
        leadership: student.activities.length > 0 ? 82 : 70,
        communication: 80,
      },
      student.name
    );

    await TalentScore.create({
      student: student._id,
      registerNumber: student.registerNumber,
      studentName: student.name,
      department: student.department,
      course: student.course,
      year: student.year,
      semester: student.semester,
      section: student.section,
      ...calc,
    });

    const populated = await Student.findById(student._id)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode')
      .populate('mentor', 'name email designation phone');

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private/Admin/Faculty
 */
exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const fields = [
      'name',
      'dob',
      'gender',
      'email',
      'phone',
      'address',
      'department',
      'course',
      'year',
      'semester',
      'section',
      'parentName',
      'parentPhone',
      'mentor',
      'mentorName',
      'initialAttendance',
      'initialMarks',
      'skills',
      'achievements',
      'activities',
      'photoUrl',
      'status',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        student[f] = req.body[f];
      }
    });

    await student.save();

    await TalentScore.updateOne(
      { student: student._id },
      {
        studentName: student.name,
        department: student.department,
        course: student.course,
        year: student.year,
        semester: student.semester,
        section: student.section,
      }
    );

    const populated = await Student.findById(student._id)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode')
      .populate('mentor', 'name email designation phone');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete student (Admin only)
 * @route   DELETE /api/students/:id
 * @access  Private/Admin
 */
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await Promise.all([
      User.deleteOne({ email: student.email }),
      Mark.deleteMany({ student: student._id }),
      TalentScore.deleteOne({ student: student._id }),
      Skill.deleteMany({ student: student._id }),
      Student.findByIdAndDelete(req.params.id),
    ]);

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        performedBy: req.user._id,
        performerName: req.user.name,
        performerRole: req.user.role,
        action: 'DELETE_STUDENT',
        module: 'Student Management',
        description: `Deleted student: ${student.name} (${student.registerNumber})`,
        details: { registerNumber: student.registerNumber, email: student.email },
      });
    }

    res.status(200).json({
      success: true,
      message: `Student ${student.name} (${student.registerNumber}) deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download Student Excel Template
 * @route   GET /api/students/template
 * @access  Private (Admin / Faculty)
 */
exports.downloadTemplate = async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ success: false, message: 'Access Denied: Excel template is restricted to faculty & admin.' });
    }
    const buffer = excelService.generateStudentTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=KCAS_Student_Import_Template.xlsx');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Preview & Validate Student Excel Upload
 * @route   POST /api/students/preview-excel
 * @access  Private/Admin/Faculty
 */
exports.previewExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel or CSV file (.xlsx, .xls, .csv)' });
    }

    const validationResult = await excelService.validateAndParseStudentExcel(req.file.buffer);
    res.status(200).json({
      success: true,
      data: validationResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirm and Import Validated Students
 * @route   POST /api/students/import
 * @access  Private/Admin/Faculty
 */
exports.importStudents = async (req, res, next) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid records provided for import.' });
    }

    const inserted = [];
    const failed = [];
    const duplicates = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (const item of records) {
      try {
        const cleanReg = String(item.registerNumber || '').toUpperCase().trim();
        const cleanEmail = String(item.email || `${cleanReg.toLowerCase()}@kcas.edu.in`).toLowerCase().trim();

        if (!cleanReg || !item.name) {
          failed.push({
            registerNumber: cleanReg || 'MISSING',
            name: item.name || 'Missing Name',
            reason: 'Missing required field: Register Number or Student Name',
          });
          continue;
        }

        const exists = await Student.findOne({
          $or: [{ registerNumber: cleanReg }, { email: cleanEmail }],
        });

        if (exists) {
          duplicates.push({
            registerNumber: cleanReg,
            name: item.name,
            reason: 'Duplicate record: Register Number or Email already exists in database',
          });
          continue;
        }

        const student = await Student.create({
          studentId: item.studentId || `STU-${cleanReg}`,
          registerNumber: cleanReg,
          rollNumber: item.rollNumber || cleanReg,
          name: item.name,
          dob: item.dob || '2004-01-01',
          gender: item.gender || 'Female',
          email: cleanEmail,
          phone: item.phone || '',
          address: item.address || 'Tiruvannamalai, Tamil Nadu',
          department: item.department,
          course: item.course,
          year: item.year || 'I Year',
          semester: item.semester || 'Semester 1',
          section: item.section || 'A',
          parentName: item.parentName || 'Parent / Guardian',
          parentPhone: item.parentPhone || '',
          mentor: item.mentor || null,
          mentorName: item.mentorName || '',
          initialAttendance: item.initialAttendance !== undefined ? item.initialAttendance : 85,
          initialMarks: item.initialMarks !== undefined ? item.initialMarks : 75,
          skills: Array.isArray(item.skills) ? item.skills : [],
          achievements: Array.isArray(item.achievements) ? item.achievements : [],
          activities: Array.isArray(item.activities) ? item.activities : [],
          talents: Array.isArray(item.talents) ? item.talents : [],
          status: 'Active',
        });

        inserted.push(student);

        // Create student user login
        try {
          const userExists = await User.findOne({ email: cleanEmail });
          if (!userExists) {
            await User.create({
              name: student.name,
              email: student.email,
              password: 'Student@123',
              role: 'student',
              department: student.department,
              referenceId: student._id,
              roleRefModel: 'Student',
              permissions: ['view_attendance', 'view_marks', 'view_talent', 'view_reports'],
            });
          }
        } catch (e) {}

        // Create initial talent scores
        const calc = talentService.calculateTalentScores(
          {
            studies: student.initialMarks || 75,
            technical: student.skills?.length ? 90 : 72,
            sports: student.achievements?.length ? 88 : 70,
            leadership: student.activities?.length ? 85 : 70,
            communication: 82,
            cultural: 75,
          },
          student.name
        );

        await TalentScore.create({
          student: student._id,
          registerNumber: student.registerNumber,
          studentName: student.name,
          department: student.department,
          course: student.course,
          year: student.year,
          semester: student.semester,
          section: student.section,
          ...calc,
        });
      } catch (err) {
        failed.push({
          registerNumber: item.registerNumber,
          name: item.name,
          reason: err.message,
        });
      }
    }

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        performedBy: req.user._id,
        performerName: req.user.name,
        performerRole: req.user.role,
        action: 'EXCEL_STUDENT_IMPORT',
        module: 'Student Management',
        description: `Bulk imported ${inserted.length} college student records (${duplicates.length} duplicates, ${failed.length} invalid).`,
        details: {
          totalRows: records.length,
          successfulRows: inserted.length,
          duplicateRows: duplicates.length,
          invalidRows: failed.length,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} student records into database.`,
      summary: {
        totalRows: records.length,
        successfulRows: inserted.length,
        duplicateRows: duplicates.length,
        invalidRows: failed.length,
        duplicateRecords: duplicates,
        invalidRecords: failed,
      },
      count: inserted.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export Students to Excel / CSV (Admin / Faculty only)
 * @route   GET /api/students/export
 * @access  Private
 */
exports.exportStudents = async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ success: false, message: 'Access Denied: Students are not permitted to export rosters.' });
    }

    const { department, course, year, semester, section, status } = req.query;
    const query = {};
    if (department && department !== 'All') query.department = department;
    if (course && course !== 'All') query.course = course;
    if (year && year !== 'All') query.year = year;
    if (semester && semester !== 'All') query.semester = semester;
    if (section && section !== 'All') query.section = section;
    if (status && status !== 'All') query.status = status;

    const students = await Student.find(query)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode')
      .populate('mentor', 'name email designation phone')
      .sort({ registerNumber: 1 });

    const exportData = students.map((s) => ({
      'Register Number': s.registerNumber,
      'Roll Number': s.rollNumber || s.registerNumber,
      'Student Name': s.name,
      'Department': s.department ? s.department.name : '',
      'Class/Section': `${s.year} ${s.course ? s.course.courseName : ''} - Sec ${s.section}`,
      'Year': s.year,
      'Semester': s.semester,
      'Email': s.email,
      'Phone Number': s.phone || '',
      'Mentor Name': s.mentor ? s.mentor.name : (s.mentorName || 'Unassigned'),
      'Attendance': `${s.initialAttendance || 85}%`,
      'Marks': `${s.initialMarks || 75}%`,
      'Skills': Array.isArray(s.skills) ? s.skills.join(', ') : '',
      'Achievements': Array.isArray(s.achievements) ? s.achievements.join('; ') : '',
      'Activities': Array.isArray(s.activities) ? s.activities.join('; ') : '',
      'Status': s.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'College_Student_Records');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=KCAS_College_Students_Export.xlsx');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
