const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Department = require('../models/Department');
const Course = require('../models/Course');
const XLSX = require('xlsx');

/**
 * @desc    Get attendance sheet for a specific class, subject and date
 * @route   GET /api/attendance/sheet
 * @access  Private
 */
exports.getAttendanceSheet = async (req, res, next) => {
  try {
    const { department, course, year, semester, section = 'A', subject, date } = req.query;

    if (!department || !course || !subject || !date) {
      return res.status(400).json({
        success: false,
        message: 'Department, Course, Subject, and Date are required parameters.',
      });
    }

    // 1. Fetch all active students in this cohort
    const studentQuery = {
      department,
      course,
      year,
      semester,
      status: 'Active',
    };
    if (section && section !== 'All') {
      studentQuery.section = section;
    }

    const students = await Student.find(studentQuery).sort({ registerNumber: 1 });

    // 2. Check if attendance already recorded for this subject on this date
    const existingAttendance = await Attendance.findOne({
      department,
      course,
      subject,
      date,
      section: section || 'A',
    });

    // 3. Build attendance record list
    const sheetData = students.map((st) => {
      let status = 'Present';
      let remarks = '';

      if (existingAttendance) {
        const found = existingAttendance.records.find((r) => String(r.student) === String(st._id));
        if (found) {
          status = found.status;
          remarks = found.remarks || '';
        }
      }

      return {
        studentId: st._id,
        registerNumber: st.registerNumber,
        rollNumber: st.rollNumber,
        name: st.name,
        gender: st.gender,
        status,
        remarks,
      };
    });

    res.status(200).json({
      success: true,
      exists: !!existingAttendance,
      attendanceId: existingAttendance ? existingAttendance._id : null,
      summary: existingAttendance
        ? {
            total: existingAttendance.totalStudents,
            present: existingAttendance.presentCount,
            absent: existingAttendance.absentCount,
          }
        : null,
      data: sheetData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save or Update attendance sheet
 * @route   POST /api/attendance/save
 * @access  Private/Faculty/Admin
 */
exports.saveAttendance = async (req, res, next) => {
  try {
    const { department, course, year, semester, section = 'A', subject, date, records } = req.body;

    if (!department || !course || !subject || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance submission payload.',
      });
    }

    let presentCount = 0;
    let absentCount = 0;

    const formattedRecords = records.map((r) => {
      if (r.status === 'Present' || r.status === 'On Duty') {
        presentCount++;
      } else {
        absentCount++;
      }
      return {
        student: r.studentId || r.student,
        registerNumber: r.registerNumber,
        status: r.status || 'Present',
        remarks: r.remarks || '',
      };
    });

    const totalStudents = formattedRecords.length;

    let attendance = await Attendance.findOne({
      department,
      course,
      subject,
      date,
      section,
    });

    if (attendance) {
      attendance.records = formattedRecords;
      attendance.totalStudents = totalStudents;
      attendance.presentCount = presentCount;
      attendance.absentCount = absentCount;
      attendance.markedBy = req.user._id;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        department,
        course,
        year,
        semester,
        section,
        subject,
        date,
        records: formattedRecords,
        totalStudents,
        presentCount,
        absentCount,
        markedBy: req.user._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attendance saved successfully',
      summary: {
        totalStudents,
        presentCount,
        absentCount,
        percentage: totalStudents > 0 ? Math.round((presentCount / totalStudents) * 1000) / 10 : 0,
      },
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance history & logs with percentage summaries
 * @route   GET /api/attendance/history
 * @access  Private
 */
exports.getAttendanceHistory = async (req, res, next) => {
  try {
    const { department, course, subject, year, semester, startDate, endDate } = req.query;
    const query = {};

    if (department && department !== 'All') query.department = department;
    if (course && course !== 'All') query.course = course;
    if (subject && subject !== 'All') query.subject = subject;
    if (year && year !== 'All') query.year = year;
    if (semester && semester !== 'All') query.semester = semester;

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const history = await Attendance.find(query)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode')
      .populate('subject', 'subjectName subjectCode')
      .populate('markedBy', 'name role')
      .sort({ date: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get overall student attendance percentage summary for a class cohort
 * @route   GET /api/attendance/summary
 * @access  Private
 */
exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const { department, course, year, semester, section } = req.query;
    const studentQuery = { status: 'Active' };
    if (department && department !== 'All') studentQuery.department = department;
    if (course && course !== 'All') studentQuery.course = course;
    if (year && year !== 'All') studentQuery.year = year;
    if (semester && semester !== 'All') studentQuery.semester = semester;
    if (section && section !== 'All') studentQuery.section = section;

    const students = await Student.find(studentQuery)
      .populate('department', 'name code')
      .populate('course', 'courseName')
      .sort({ registerNumber: 1 });

    const attendanceDocs = await Attendance.find({
      ...(department && department !== 'All' ? { department } : {}),
      ...(course && course !== 'All' ? { course } : {}),
      ...(year && year !== 'All' ? { year } : {}),
      ...(semester && semester !== 'All' ? { semester } : {}),
    });

    const totalWorkingSessions = attendanceDocs.length;

    const studentSummaries = students.map((st) => {
      let presentCount = 0;
      let absentCount = 0;

      attendanceDocs.forEach((att) => {
        const rec = att.records.find((r) => String(r.student) === String(st._id));
        if (rec) {
          if (rec.status === 'Present' || rec.status === 'On Duty') {
            presentCount++;
          } else {
            absentCount++;
          }
        }
      });

      const totalRecorded = presentCount + absentCount;
      const percentage = totalRecorded > 0 ? Math.round((presentCount / totalRecorded) * 1000) / 10 : 100;
      const status = percentage >= 75 ? 'Healthy' : percentage >= 65 ? 'Warning' : 'Low';

      return {
        studentId: st._id,
        registerNumber: st.registerNumber,
        rollNumber: st.rollNumber,
        name: st.name,
        department: st.department ? st.department.name : '',
        course: st.course ? st.course.courseName : '',
        year: st.year,
        section: st.section,
        totalSessions: totalRecorded,
        presentCount,
        absentCount,
        percentage,
        status,
      };
    });

    res.status(200).json({
      success: true,
      totalStudents: students.length,
      totalWorkingSessions,
      data: studentSummaries,
    });
  } catch (error) {
    next(error);
  }
};
