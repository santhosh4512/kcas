const Student = require('../models/Student');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const TalentScore = require('../models/TalentScore');
const Skill = require('../models/Skill');
const User = require('../models/User');
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
      limit = 20,
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
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode duration')
      .sort({ registerNumber: 1 })
      .skip(skip)
      .limit(limitNum);

    // Attach talent snapshot if exists
    const enrichedStudents = await Promise.all(
      students.map(async (st) => {
        const talent = await TalentScore.findOne({ student: st._id }).select(
          'dominantCategoryName highestScore primaryTalent secondaryStrength isJointHighest'
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
      .populate('course', 'courseName courseCode duration courseType');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // 1. Fetch Marks
    const marks = await Mark.find({ student: student._id }).populate('subject', 'subjectName subjectCode credits');

    // Calculate Academic Average
    let academicAverage = 0;
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

    const attendancePercentage = totalWorkingDays > 0 
      ? Math.round((presentDays / totalWorkingDays) * 1000) / 10 
      : 0;

    // 3. Fetch Talent Scores & Auto-Sync Studies category from academic average
    let talent = await TalentScore.findOne({ student: student._id });
    if (!talent && academicAverage > 0) {
      // Auto-create initial talent record
      const calculated = talentService.calculateTalentScores(
        { studies: academicAverage },
        student.name
      );
      talent = await TalentScore.create({
        student: student._id,
        registerNumber: student.registerNumber,
        studentName: student.name,
        department: student.department._id,
        course: student.course._id,
        year: student.year,
        semester: student.semester,
        section: student.section,
        ...calculated,
      });
    }

    // 4. Fetch Specific Skills & Achievements
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
          totalWorkingDays,
          presentDays,
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
 * @desc    Create student
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
      photoUrl,
      status,
      createAccount = true,
    } = req.body;

    const existing = await Student.findOne({
      $or: [{ registerNumber: registerNumber.toUpperCase().trim() }, { email: email.toLowerCase().trim() }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Student with this Register Number or Email already exists.',
      });
    }

    const student = await Student.create({
      studentId: `STU-${registerNumber.toUpperCase().trim()}`,
      registerNumber: registerNumber.toUpperCase().trim(),
      rollNumber: rollNumber.toUpperCase().trim(),
      name: name.trim(),
      dob: dob || '2005-01-01',
      gender: gender || 'Female',
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address || 'Tiruvannamalai, Tamil Nadu',
      department,
      course,
      year: year || 'I Year',
      semester: semester || 'Semester 1',
      section: section || 'A',
      parentName: parentName || '',
      parentPhone: parentPhone || '',
      photoUrl: photoUrl || '',
      status: status || 'Active',
    });

    // Create student user account for student portal
    if (createAccount) {
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
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

    // Initialize blank talent profile
    const calculated = talentService.calculateTalentScores({ studies: 0 }, student.name);
    await TalentScore.create({
      student: student._id,
      registerNumber: student.registerNumber,
      studentName: student.name,
      department: student.department,
      course: student.course,
      year: student.year,
      semester: student.semester,
      section: student.section,
      ...calculated,
    });

    const populated = await Student.findById(student._id)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode');

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
      'photoUrl',
      'status',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        student[f] = req.body[f];
      }
    });

    await student.save();

    // Sync talent record student name
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
      .populate('course', 'courseName courseCode');

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
 * @desc    Delete student
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

    res.status(200).json({
      success: true,
      message: 'Student and related records deleted successfully',
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
      return res.status(400).json({ success: false, message: 'Please upload an Excel file (.xlsx, .xls)' });
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
      return res.status(400).json({ success: false, message: 'No valid records provided for import' });
    }

    const inserted = [];
    for (const item of records) {
      const student = await Student.create({
        studentId: item.studentId || `STU-${item.registerNumber}`,
        registerNumber: item.registerNumber,
        rollNumber: item.rollNumber,
        name: item.name,
        dob: item.dob || '2005-01-01',
        gender: item.gender || 'Female',
        email: item.email,
        phone: item.phone,
        address: item.address || 'Tiruvannamalai',
        department: item.department,
        course: item.course,
        year: item.year || 'I Year',
        semester: item.semester || 'Semester 1',
        section: item.section || 'A',
        parentName: item.parentName || '',
        parentPhone: item.parentPhone || '',
        status: 'Active',
      });
      inserted.push(student);

      // Create student user account
      try {
        await User.create({
          name: student.name,
          email: student.email,
          password: 'Student@123',
          role: 'student',
          department: student.department,
          referenceId: student._id,
          roleRefModel: 'Student',
        });
      } catch (e) {}

      // Create blank initial talent score
      const calc = talentService.calculateTalentScores({ studies: 0 }, student.name);
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
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} students.`,
      count: inserted.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export Students to Excel
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
      .sort({ registerNumber: 1 });

    const exportData = students.map((s) => ({
      'Register Number': s.registerNumber,
      'Roll Number': s.rollNumber,
      'Student Name': s.name,
      'Gender': s.gender,
      'Department': s.department ? s.department.name : '',
      'Department Code': s.department ? s.department.code : '',
      'Course': s.course ? s.course.courseName : '',
      'Year': s.year,
      'Semester': s.semester,
      'Section': s.section,
      'Email': s.email,
      'Phone': s.phone,
      'Parent Name': s.parentName,
      'Parent Phone': s.parentPhone,
      'Address': s.address,
      'Status': s.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student_Directory');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=KCAS_Student_Export.xlsx');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
