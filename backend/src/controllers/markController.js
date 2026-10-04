const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Department = require('../models/Department');
const Course = require('../models/Course');
const TalentScore = require('../models/TalentScore');
const excelService = require('../services/excelService');
const talentService = require('../services/talentService');
const XLSX = require('xlsx');

// Helper to resolve student record for the authenticated user
async function resolveStudent(req) {
  if (req.user.referenceId) {
    const s = await Student.findById(req.user.referenceId).populate('department course');
    if (s) return s;
  }
  const byEmail = await Student.findOne({ email: req.user.email }).populate('department course');
  return byEmail;
}

/**
 * @desc    Get authenticated student's personal marks & transcript
 * @route   GET /api/marks/me
 * @access  Private (Student)
 */
exports.getMyMarks = async (req, res, next) => {
  try {
    const student = await resolveStudent(req);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const marks = await Mark.find({ student: student._id })
      .populate('subject', 'subjectName subjectCode credits semester')
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode')
      .sort({ semester: 1, subjectCode: 1 });

    const totalEvaluations = marks.length;
    const passedEvaluations = marks.filter((m) => m.resultStatus === 'Pass').length;
    const failedEvaluations = marks.filter((m) => m.resultStatus === 'Fail').length;
    const totalMarksSum = marks.reduce((acc, m) => acc + (m.totalMark || 0), 0);
    const overallPercentage = totalEvaluations > 0 ? Math.round((totalMarksSum / totalEvaluations) * 10) / 10 : (student.initialMarks || 75);

    // Group by semester
    const semesterMap = {};
    marks.forEach((m) => {
      const sem = m.semester || 'Semester 1';
      if (!semesterMap[sem]) {
        semesterMap[sem] = [];
      }
      semesterMap[sem].push(m);
    });

    res.status(200).json({
      success: true,
      student,
      summary: {
        totalEvaluations,
        passedEvaluations,
        failedEvaluations,
        overallPercentage,
        resultStatus: failedEvaluations === 0 && totalEvaluations > 0 ? 'First Class / Exemplary' : failedEvaluations > 0 ? 'Arrear(s) Pending' : 'In Progress',
      },
      semesterMarks: semesterMap,
      allMarks: marks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get marks with multi-criteria filters & pagination
 * @route   GET /api/marks
 * @access  Private
 */
exports.getMarks = async (req, res, next) => {
  try {
    const {
      department,
      course,
      semester,
      subject,
      resultStatus,
      grade,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    // Privacy rule: Student role can only access their own marks
    if (req.user.role === 'student') {
      const student = await resolveStudent(req);
      if (student) {
        query.student = student._id;
      }
    } else {
      if (department && department !== 'All') query.department = department;
      if (course && course !== 'All') query.course = course;
      if (semester && semester !== 'All') query.semester = semester;
      if (subject && subject !== 'All') query.subject = subject;
      if (resultStatus && resultStatus !== 'All') query.resultStatus = resultStatus;
      if (grade && grade !== 'All') query.grade = grade;
    }

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { registerNumber: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } },
        { subjectName: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Mark.countDocuments(query);
    const marks = await Mark.find(query)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode')
      .populate('subject', 'subjectName subjectCode credits')
      .sort({ registerNumber: 1, subjectCode: 1 })
      .skip(skip)
      .limit(limitNum);

    const allFiltered = await Mark.find(query);
    const passCount = allFiltered.filter((m) => m.resultStatus === 'Pass').length;
    const failCount = allFiltered.filter((m) => m.resultStatus === 'Fail').length;
    const avgPercentage =
      allFiltered.length > 0
        ? Math.round(
            (allFiltered.reduce((acc, m) => acc + (m.totalMark || 0), 0) / allFiltered.length) * 10
          ) / 10
        : 0;

    res.status(200).json({
      success: true,
      count: marks.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      analytics: {
        totalEvaluated: allFiltered.length,
        passCount,
        failCount,
        passPercentage: allFiltered.length > 0 ? Math.round((passCount / allFiltered.length) * 1000) / 10 : 0,
        avgPercentage,
      },
      data: marks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update single mark entry (Admin / Faculty)
 * @route   POST /api/marks
 * @access  Private/Faculty/Admin
 */
exports.saveMark = async (req, res, next) => {
  try {
    const { studentId, subjectId, internalMark, externalMark, semester } = req.body;

    const [student, subject] = await Promise.all([
      Student.findById(studentId),
      Subject.findById(subjectId),
    ]);

    if (!student || !subject) {
      return res.status(404).json({ success: false, message: 'Student or Subject not found.' });
    }

    const internal = Number(internalMark);
    const external = Number(externalMark);

    if (isNaN(internal) || internal < 0 || internal > 25) {
      return res.status(400).json({ success: false, message: 'Internal Mark must be between 0 and 25.' });
    }
    if (isNaN(external) || external < 0 || external > 75) {
      return res.status(400).json({ success: false, message: 'External Mark must be between 0 and 75.' });
    }

    let mark = await Mark.findOne({
      student: student._id,
      subject: subject._id,
      semester: semester || subject.semester,
    });

    if (mark) {
      mark.internalMark = internal;
      mark.externalMark = external;
      mark.enteredBy = req.user._id;
      await mark.save();
    } else {
      mark = await Mark.create({
        student: student._id,
        registerNumber: student.registerNumber,
        studentName: student.name,
        department: student.department,
        course: student.course,
        semester: semester || subject.semester,
        subject: subject._id,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        internalMark: internal,
        externalMark: external,
        enteredBy: req.user._id,
      });
    }

    // Auto-update student's Studies talent category based on new academic average
    const allStudentMarks = await Mark.find({ student: student._id });
    if (allStudentMarks.length > 0) {
      const avg = Math.round(
        allStudentMarks.reduce((acc, m) => acc + (m.totalMark || 0), 0) / allStudentMarks.length
      );
      let talentDoc = await TalentScore.findOne({ student: student._id });
      if (talentDoc) {
        const scores = { ...talentDoc.categoryScores.toObject(), studies: avg };
        const recalculated = talentService.calculateTalentScores(scores, student.name);
        Object.assign(talentDoc, recalculated);
        await talentDoc.save();
      }
    }

    const populated = await Mark.findById(mark._id)
      .populate('department', 'name code')
      .populate('course', 'courseName')
      .populate('subject', 'subjectName subjectCode credits');

    res.status(200).json({
      success: true,
      message: 'Mark recorded and results computed successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a mark record (Admin / Faculty)
 * @route   DELETE /api/marks/:id
 * @access  Private/Faculty/Admin
 */
exports.deleteMark = async (req, res, next) => {
  try {
    const mark = await Mark.findById(req.params.id);
    if (!mark) {
      return res.status(404).json({ success: false, message: 'Mark record not found' });
    }

    await Mark.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Mark record deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download Marks Excel Template
 * @route   GET /api/marks/template
 * @access  Private/Faculty/Admin
 */
exports.downloadTemplate = async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ success: false, message: 'Access Denied.' });
    }
    const buffer = excelService.generateMarksTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=KCAS_Marks_Import_Template.xlsx');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Preview & Validate Marks Excel Upload
 * @route   POST /api/marks/preview-excel
 * @access  Private/Faculty/Admin
 */
exports.previewExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file (.xlsx, .xls)' });
    }

    const validationResult = await excelService.validateAndParseMarksExcel(req.file.buffer);
    res.status(200).json({
      success: true,
      data: validationResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirm and Import Validated Marks
 * @route   POST /api/marks/import
 * @access  Private/Faculty/Admin
 */
exports.importMarks = async (req, res, next) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid records provided for import' });
    }

    const inserted = [];
    for (const item of records) {
      let mark = await Mark.findOne({
        student: item.student,
        subject: item.subject,
        semester: item.semester,
      });

      if (mark) {
        mark.internalMark = item.internalMark;
        mark.externalMark = item.externalMark;
        mark.enteredBy = req.user._id;
        await mark.save();
        inserted.push(mark);
      } else {
        mark = await Mark.create({
          student: item.student,
          registerNumber: item.registerNumber,
          studentName: item.studentName,
          department: item.department,
          course: item.course,
          semester: item.semester,
          subject: item.subject,
          subjectCode: item.subjectCode,
          subjectName: item.subjectName,
          internalMark: item.internalMark,
          externalMark: item.externalMark,
          enteredBy: req.user._id,
        });
        inserted.push(mark);
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully processed and imported ${inserted.length} marks with computed grades.`,
      count: inserted.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Batch Save marks for an entire cohort / subject
 * @route   POST /api/marks/batch
 * @access  Private/Faculty/Admin
 */
exports.batchSaveMarks = async (req, res, next) => {
  try {
    const { subjectId, semester, records } = req.body;
    if (!subjectId || !records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid payload or empty records.' });
    }

    const subject = await Subject.findById(subjectId).populate('department').populate('course');
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    const processed = [];
    const studentIdsToUpdate = new Set();

    for (const item of records) {
      const { studentId, internalMark, externalMark } = item;
      const student = await Student.findById(studentId);
      if (!student) continue;

      const internal = Math.min(25, Math.max(0, Number(internalMark) || 0));
      const external = Math.min(75, Math.max(0, Number(externalMark) || 0));

      let mark = await Mark.findOne({
        student: student._id,
        subject: subject._id,
        semester: semester || subject.semester,
      });

      if (mark) {
        mark.internalMark = internal;
        mark.externalMark = external;
        mark.enteredBy = req.user._id;
        await mark.save();
      } else {
        mark = await Mark.create({
          student: student._id,
          registerNumber: student.registerNumber,
          studentName: student.name,
          department: student.department,
          course: student.course,
          semester: semester || subject.semester,
          subject: subject._id,
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          internalMark: internal,
          externalMark: external,
          enteredBy: req.user._id,
        });
      }
      processed.push(mark);
      studentIdsToUpdate.add(student._id.toString());
    }

    // Auto-update student's Studies talent category
    for (const sId of studentIdsToUpdate) {
      const allStudentMarks = await Mark.find({ student: sId });
      if (allStudentMarks.length > 0) {
        const avg = Math.round(
          allStudentMarks.reduce((acc, m) => acc + (m.totalMark || 0), 0) / allStudentMarks.length
        );
        const student = await Student.findById(sId);
        let talentDoc = await TalentScore.findOne({ student: sId });
        if (talentDoc && student) {
          const scores = { ...talentDoc.categoryScores.toObject(), studies: avg };
          const recalculated = talentService.calculateTalentScores(scores, student.name);
          Object.assign(talentDoc, recalculated);
          await talentDoc.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully saved & calculated grades for ${processed.length} students.`,
      count: processed.length,
      data: processed,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed marks transcript for a specific student
 * @route   GET /api/marks/student/:studentId
 * @access  Private
 */
exports.getStudentMarks = async (req, res, next) => {
  try {
    // Privacy rule
    if (req.user.role === 'student') {
      const myStudent = await resolveStudent(req);
      if (!myStudent || String(myStudent._id) !== String(req.params.studentId)) {
        return res.status(403).json({ success: false, message: 'Access Denied: You cannot access other students marks.' });
      }
    }

    const student = await Student.findById(req.params.studentId)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const marks = await Mark.find({ student: student._id })
      .populate('subject', 'subjectName subjectCode credits semester')
      .sort({ semester: 1, subjectCode: 1 });

    const totalEvaluations = marks.length;
    const passedEvaluations = marks.filter((m) => m.resultStatus === 'Pass').length;
    const failedEvaluations = marks.filter((m) => m.resultStatus === 'Fail').length;
    const totalMarksSum = marks.reduce((acc, m) => acc + (m.totalMark || 0), 0);
    const overallPercentage = totalEvaluations > 0 ? Math.round((totalMarksSum / totalEvaluations) * 10) / 10 : 0;

    const semesterMap = {};
    marks.forEach((m) => {
      const sem = m.semester || 'Semester 1';
      if (!semesterMap[sem]) {
        semesterMap[sem] = [];
      }
      semesterMap[sem].push(m);
    });

    res.status(200).json({
      success: true,
      student,
      summary: {
        totalEvaluations,
        passedEvaluations,
        failedEvaluations,
        overallPercentage,
        resultStatus: failedEvaluations === 0 && totalEvaluations > 0 ? 'First Class / Exemplary' : failedEvaluations > 0 ? 'Arrear(s) Pending' : 'In Progress',
      },
      semesterMarks: semesterMap,
      allMarks: marks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export Marks to Excel (Admin / Faculty only)
 * @route   GET /api/marks/export
 * @access  Private
 */
exports.exportMarks = async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ success: false, message: 'Access Denied: Students are not permitted to export marks datasets.' });
    }

    const { department, course, semester, subject, resultStatus } = req.query;
    const query = {};
    if (department && department !== 'All') query.department = department;
    if (course && course !== 'All') query.course = course;
    if (semester && semester !== 'All') query.semester = semester;
    if (subject && subject !== 'All') query.subject = subject;
    if (resultStatus && resultStatus !== 'All') query.resultStatus = resultStatus;

    const marks = await Mark.find(query)
      .populate('department', 'name code')
      .populate('course', 'courseName')
      .populate('subject', 'subjectName subjectCode')
      .sort({ registerNumber: 1 });

    const exportData = marks.map((m) => ({
      'Register Number': m.registerNumber,
      'Student Name': m.studentName,
      'Department': m.department ? m.department.name : '',
      'Course': m.course ? m.course.courseName : '',
      'Semester': m.semester,
      'Subject Code': m.subjectCode,
      'Subject Name': m.subjectName,
      'Internal Mark (25)': m.internalMark,
      'External Mark (75)': m.externalMark,
      'Total Mark (100)': m.totalMark,
      'Percentage (%)': `${m.percentage}%`,
      'Grade': m.grade,
      'Result Status': m.resultStatus,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Marks_Results');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=KCAS_Marks_Export.xlsx');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
