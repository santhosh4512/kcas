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

/**
 * @desc    Get students with multi-criteria filters & pagination
 * @route   GET /api/students
 * @access  Private
 */
exports.getStudents = async (req, res, next) => {
  try {
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
    const student = await Student.findById(req.params.id)
      .populate('department', 'name code hod')
      .populate('course', 'courseName courseCode duration courseType')
      .populate('mentor', 'name email designation phone');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // 1. Fetch Marks
    const marks = await Mark.find({ student: student._id }).populate('subject', 'subjectName subjectCode credits');

    // Calculate Academic Average
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
          arts: 75,
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
    const cleanEmail = (email || `${cleanReg.toLowerCase()}@kambancollege.edu.in`).toLowerCase().trim();

    const existing = await Student.findOne({
      $or: [{ registerNumber: cleanReg }, { email: cleanEmail }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Student with this Register Number or Email already exists.',
      });
    }

    // Match or create Faculty Mentor if mentorName is provided
    let mentorId = null;
    if (mentorName && mentorName.trim()) {
      let faculty = await Faculty.findOne({ name: { $regex: `^${mentorName.trim()}$`, $options: 'i' } });
      if (!faculty) {
        const empCode = `FAC-${Math.floor(100 + Math.random() * 900)}`;
        const facEmail = `${mentorName.toLowerCase().replace(/[^a-z0-9]/g, '')}@kambancollege.edu.in`;
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

        // Create Faculty User login
        const existingFacUser = await User.findOne({ email: facEmail });
        if (!existingFacUser) {
          await User.create({
            name: faculty.name,
            email: facEmail,
            password: 'faculty123',
            role: 'faculty',
            department,
            referenceId: faculty._id,
            roleRefModel: 'Faculty',
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
        }
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

    // Sync talent record
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

    // Log deletion
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
 * @access  Private
 */
exports.downloadTemplate = async (req, res, next) => {
  try {
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
    const todayStr = new Date().toISOString().split('T')[0];

    // Fetch subjects cache to link initial marks
    const allSubjects = await Subject.find({});
    const subjectMap = new Map();
    allSubjects.forEach((s) => {
      subjectMap.set(String(s.department), s);
    });

    for (const item of records) {
      try {
        const cleanReg = String(item.registerNumber || '').toUpperCase().trim();
        const cleanEmail = String(item.email || `${cleanReg.toLowerCase()}@kambancollege.edu.in`).toLowerCase().trim();

        // Check if student already exists
        const exists = await Student.findOne({
          $or: [{ registerNumber: cleanReg }, { email: cleanEmail }],
        });

        if (exists) {
          failed.push({
            registerNumber: cleanReg,
            name: item.name,
            reason: 'Record already exists in the database',
          });
          continue;
        }

        // Mentor resolution or creation
        let mentorId = item.mentor || null;
        if (!mentorId && item.mentorName && item.mentorName.trim()) {
          let fac = await Faculty.findOne({ name: { $regex: `^${item.mentorName.trim()}$`, $options: 'i' } });
          if (!fac) {
            const empCode = `FAC-${Math.floor(100 + Math.random() * 900)}`;
            const facEmail = `${item.mentorName.toLowerCase().replace(/[^a-z0-9]/g, '')}@kambancollege.edu.in`;
            fac = await Faculty.create({
              facultyId: empCode,
              employeeId: empCode,
              name: item.mentorName.trim(),
              email: facEmail,
              department: item.department,
              designation: 'Faculty Mentor',
              qualification: 'M.Sc., M.Phil., Ph.D.',
              status: 'Active',
            });

            // Create Faculty User account
            const existingUser = await User.findOne({ email: facEmail });
            if (!existingUser) {
              await User.create({
                name: fac.name,
                email: facEmail,
                password: 'faculty123',
                role: 'faculty',
                department: item.department,
                referenceId: fac._id,
                roleRefModel: 'Faculty',
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
            }
          }
          mentorId = fac._id;
        }

        // Create student document
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
          mentor: mentorId,
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
            technical: student.skills && student.skills.length > 0 ? 90 : 72,
            sports: student.achievements && student.achievements.length > 0 ? 88 : 70,
            leadership: student.activities && student.activities.length > 0 ? 85 : 70,
            communication: 82,
            arts: 75,
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

        // Create initial marks record if department has subjects
        const matchedSubject = subjectMap.get(String(student.department));
        if (matchedSubject) {
          const markVal = student.initialMarks || 75;
          const intMark = Math.min(25, Math.round((markVal * 25) / 100));
          const extMark = Math.min(75, Math.round((markVal * 75) / 100));
          await Mark.create({
            student: student._id,
            registerNumber: student.registerNumber,
            studentName: student.name,
            department: student.department,
            course: student.course,
            semester: student.semester,
            subject: matchedSubject._id,
            subjectCode: matchedSubject.subjectCode,
            subjectName: matchedSubject.subjectName,
            internalMark: intMark,
            externalMark: extMark,
            totalMark: intMark + extMark,
            percentage: markVal,
            grade: markVal >= 80 ? 'A+' : markVal >= 60 ? 'A' : markVal >= 50 ? 'B' : 'RA',
            resultStatus: markVal >= 40 ? 'Pass' : 'Fail',
          });
        }

        // Link with attendance record
        if (matchedSubject) {
          let attSheet = await Attendance.findOne({
            department: student.department,
            course: student.course,
            date: todayStr,
            section: student.section,
          });

          const attStatus = student.initialAttendance >= 50 ? 'Present' : 'Absent';
          if (!attSheet) {
            await Attendance.create({
              department: student.department,
              course: student.course,
              year: student.year,
              semester: student.semester,
              section: student.section,
              subject: matchedSubject._id,
              date: todayStr,
              totalStudents: 1,
              presentCount: attStatus === 'Present' ? 1 : 0,
              absentCount: attStatus === 'Absent' ? 1 : 0,
              markedBy: req.user ? req.user._id : null,
              records: [
                {
                  student: student._id,
                  registerNumber: student.registerNumber,
                  status: attStatus,
                  verificationMethod: 'MANUAL_FACULTY',
                },
              ],
            });
          } else {
            const alreadyInSheet = attSheet.records.some((r) => String(r.student) === String(student._id));
            if (!alreadyInSheet) {
              attSheet.records.push({
                student: student._id,
                registerNumber: student.registerNumber,
                status: attStatus,
                verificationMethod: 'MANUAL_FACULTY',
              });
              attSheet.totalStudents = attSheet.records.length;
              attSheet.presentCount = attSheet.records.filter((r) => r.status === 'Present' || r.status === 'On Duty').length;
              attSheet.absentCount = attSheet.records.filter((r) => r.status === 'Absent').length;
              await attSheet.save();
            }
          }
        }
      } catch (err) {
        failed.push({
          registerNumber: item.registerNumber,
          name: item.name,
          reason: err.message,
        });
      }
    }

    // Create Audit Log
    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        performedBy: req.user._id,
        performerName: req.user.name,
        performerRole: req.user.role,
        action: 'EXCEL_STUDENT_IMPORT',
        module: 'Student Management',
        description: `Bulk imported ${inserted.length} college student records (${failed.length} failed/duplicates).`,
        details: {
          successCount: inserted.length,
          failedCount: failed.length,
          failedRecords: failed,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} student records into database. ${failed.length > 0 ? `(${failed.length} duplicate/failed records skipped)` : ''}`,
      count: inserted.length,
      failedCount: failed.length,
      failedRecords: failed,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export Students to Excel / CSV
 * @route   GET /api/students/export
 * @access  Private
 */
exports.exportStudents = async (req, res, next) => {
  try {
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
