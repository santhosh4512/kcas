const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Department = require('../models/Department');
const Course = require('../models/Course');
const GeoCheckinLog = require('../models/GeoCheckinLog');
const AuditLog = require('../models/AuditLog');
const XLSX = require('xlsx');

// Campus Coordinates: Kamban College of Arts and Science for Women (Velu Nagar, Mathur, Tiruvannamalai)
const CAMPUS_LAT = 12.1903;
const CAMPUS_LNG = 79.0839;
const DEFAULT_GEOFENCE_RADIUS = 1000; // 1000 meters


function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * @desc Get attendance sheet for a specific class, subject and date
 * @route GET /api/attendance/sheet
 */
exports.getAttendanceSheet = async (req, res, next) => {
  try {
    const { department, course, year, semester, section = 'A', subject, date } = req.query;

    if (!department || !course || !date) {
      return res.status(400).json({
        success: false,
        message: 'Department, Course, and Date are required parameters.',
      });
    }

    const studentQuery = { department, course, status: 'Active' };
    if (year && year !== 'All') studentQuery.year = year;
    if (semester && semester !== 'All') studentQuery.semester = semester;
    if (section && section !== 'All') studentQuery.section = section;

    let students = await Student.find(studentQuery).sort({ registerNumber: 1 });
    if (students.length === 0) {
      students = await Student.find({ department, course, status: 'Active' }).sort({ registerNumber: 1 });
    }

    const attendanceFilter = { department, course, date };
    if (subject && subject !== 'All') attendanceFilter.subject = subject;
    if (section && section !== 'All') attendanceFilter.section = section;

    const existingAttendance = await Attendance.findOne(attendanceFilter);

    const sheetData = students.map((st) => {
      let status = 'Present';
      let remarks = '';
      let isGeoVerified = false;
      let verificationMethod = 'MANUAL_FACULTY';
      let isOverridden = false;
      let overrideReason = '';

      if (existingAttendance) {
        const found = existingAttendance.records.find((r) => String(r.student) === String(st._id));
        if (found) {
          status = found.status;
          remarks = found.remarks || '';
          isGeoVerified = found.isGeoVerified || false;
          verificationMethod = found.verificationMethod || 'MANUAL_FACULTY';
          isOverridden = found.isOverridden || false;
          overrideReason = found.overrideReason || '';
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
        isGeoVerified,
        verificationMethod,
        isOverridden,
        overrideReason,
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
 * @desc Save or Update attendance sheet
 * @route POST /api/attendance/save
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
        isGeoVerified: Boolean(r.isGeoVerified),
        verificationMethod: r.verificationMethod || 'MANUAL_FACULTY',
        isOverridden: Boolean(r.isOverridden),
        overrideReason: r.overrideReason || '',
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
      attendance.markedBy = req.user ? req.user._id : null;
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
        markedBy: req.user ? req.user._id : null,
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
 * @desc Geo-Verified Smart Attendance Check-in (GPS Check against Kamban College campus)
 * @route POST /api/attendance/geo-checkin
 */
exports.submitGeoCheckin = async (req, res, next) => {
  try {
    const { studentId, latitude, longitude, accuracy, status = 'Present', remarks } = req.body;
    const targetStudentId = studentId || (req.user && req.user.referenceId);

    if (!targetStudentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const student = await Student.findById(targetStudentId).populate('department course');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const todayDate = new Date().toISOString().split('T')[0];

    // Check if coordinates were supplied
    if (!latitude || !longitude) {
      await GeoCheckinLog.create({
        student: student._id,
        registerNumber: student.registerNumber,
        studentName: student.name,
        department: student.department ? student.department._id : null,
        date: todayDate,
        status: 'FAILED_PERMISSION_DENIED',
        failureReason: 'GPS Location Permission Denied or Not Provided',
        userCoordinates: { latitude: 0, longitude: 0, accuracy: 0 },
      });

      return res.status(400).json({
        success: false,
        message: 'Location access required. Please enable GPS permissions on your device.',
      });
    }

    // Calculate distance from Kamban College campus
    const distanceMeters = calculateDistanceInMeters(Number(latitude), Number(longitude), CAMPUS_LAT, CAMPUS_LNG);
    const isWithinCampus = distanceMeters <= DEFAULT_GEOFENCE_RADIUS;

    if (!isWithinCampus) {
      // Record failed geolocation attempt
      const distanceKm = (distanceMeters / 1000).toFixed(2);
      await GeoCheckinLog.create({
        student: student._id,
        registerNumber: student.registerNumber,
        studentName: student.name,
        department: student.department ? student.department._id : null,
        date: todayDate,
        status: 'FAILED_OUT_OF_CAMPUS',
        attendanceStatus: 'Absent',
        userCoordinates: { latitude: Number(latitude), longitude: Number(longitude), accuracy: Number(accuracy) || 10 },
        distanceFromCampusMeters: distanceMeters,
        geofenceRadiusMeters: DEFAULT_GEOFENCE_RADIUS,
        failureReason: `Outside college geofence! You are ${distanceKm} km away from Kamban College campus (Max allowed: 1 km).`,
      });

      return res.status(403).json({
        success: false,
        isGeoVerified: false,
        distanceMeters,
        allowedRadius: DEFAULT_GEOFENCE_RADIUS,
        message: `❌ Geolocation Verification Failed: You are ${distanceKm} km away from Kamban College campus. Attendance can only be marked inside the college campus geofence.`,
      });
    }

    // Success! Log geo-checkin
    await GeoCheckinLog.create({
      student: student._id,
      registerNumber: student.registerNumber,
      studentName: student.name,
      department: student.department ? student.department._id : null,
      date: todayDate,
      status: 'SUCCESS_IN_CAMPUS',
      attendanceStatus: status,
      userCoordinates: { latitude: Number(latitude), longitude: Number(longitude), accuracy: Number(accuracy) || 10 },
      distanceFromCampusMeters: distanceMeters,
      geofenceRadiusMeters: DEFAULT_GEOFENCE_RADIUS,
      deviceInfo: req.headers['user-agent'] || 'Web Client',
      ipAddress: req.ip || '',
    });

    // Update or create attendance entry for today
    let subject = await Subject.findOne({ department: student.department, semester: student.semester });
    if (!subject) {
      subject = await Subject.findOne();
    }

    if (subject) {
      let attendanceDoc = await Attendance.findOne({
        department: student.department,
        course: student.course,
        date: todayDate,
        section: student.section || 'A',
      });

      if (!attendanceDoc) {
        attendanceDoc = new Attendance({
          department: student.department,
          course: student.course,
          year: student.year,
          semester: student.semester,
          section: student.section || 'A',
          subject: subject._id,
          date: todayDate,
          records: [],
          totalStudents: 1,
          presentCount: 1,
          absentCount: 0,
        });
      }

      const recIndex = attendanceDoc.records.findIndex((r) => r.student.toString() === student._id.toString());
      if (recIndex >= 0) {
        attendanceDoc.records[recIndex].status = status;
        attendanceDoc.records[recIndex].isGeoVerified = true;
        attendanceDoc.records[recIndex].verificationMethod = 'GPS_CAMPUS';
        attendanceDoc.records[recIndex].geoCoordinates = {
          latitude: Number(latitude),
          longitude: Number(longitude),
          distanceMeters,
        };
      } else {
        attendanceDoc.records.push({
          student: student._id,
          registerNumber: student.registerNumber,
          status,
          remarks: remarks || 'Geo-Verified Campus Check-in',
          isGeoVerified: true,
          verificationMethod: 'GPS_CAMPUS',
          geoCoordinates: {
            latitude: Number(latitude),
            longitude: Number(longitude),
            distanceMeters,
          },
        });
      }

      // Recalculate summary counts
      attendanceDoc.totalStudents = attendanceDoc.records.length;
      attendanceDoc.presentCount = attendanceDoc.records.filter((r) => r.status === 'Present' || r.status === 'On Duty').length;
      attendanceDoc.absentCount = attendanceDoc.records.length - attendanceDoc.presentCount;
      await attendanceDoc.save();
    }

    res.status(200).json({
      success: true,
      isGeoVerified: true,
      distanceMeters,
      message: `✅ Geo-Verification Successful! You are inside Kamban College campus (${distanceMeters}m from center). Attendance recorded as ${status}.`,
      data: {
        student: student.name,
        registerNumber: student.registerNumber,
        date: todayDate,
        status,
        distanceMeters,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Manual Attendance Override with Mandatory Audit Trail
 * @route POST /api/attendance/override
 */
exports.manualOverrideAttendance = async (req, res, next) => {
  try {
    const { attendanceId, studentId, newStatus, reason } = req.body;

    if (!studentId || !newStatus || !reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, New Status, and Modification Reason are strictly required for manual override.',
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    let attendance;
    if (attendanceId) {
      attendance = await Attendance.findById(attendanceId);
    } else {
      const todayDate = new Date().toISOString().split('T')[0];
      attendance = await Attendance.findOne({
        department: student.department,
        date: todayDate,
      });
    }

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found for this date/class' });
    }

    const rec = attendance.records.find((r) => r.student.toString() === student._id.toString());
    const oldStatus = rec ? rec.status : 'Not Recorded';

    if (rec) {
      rec.originalStatus = oldStatus;
      rec.status = newStatus;
      rec.isOverridden = true;
      rec.overrideReason = reason.trim();
      rec.overriddenBy = req.user ? req.user._id : null;
      rec.overriddenAt = new Date();
      rec.verificationMethod = 'OVERRIDE';
    } else {
      attendance.records.push({
        student: student._id,
        registerNumber: student.registerNumber,
        status: newStatus,
        originalStatus: 'Not Recorded',
        isOverridden: true,
        overrideReason: reason.trim(),
        overriddenBy: req.user ? req.user._id : null,
        overriddenAt: new Date(),
        verificationMethod: 'OVERRIDE',
      });
    }

    // Recalculate totals
    attendance.presentCount = attendance.records.filter((r) => r.status === 'Present' || r.status === 'On Duty').length;
    attendance.absentCount = attendance.records.length - attendance.presentCount;
    await attendance.save();

    // Mandatory Audit Log entry
    await AuditLog.create({
      user: req.user ? req.user._id : null,
      performedBy: req.user ? req.user._id : null,
      performerName: req.user ? req.user.name : 'Authorized Staff',
      performerRole: req.user ? req.user.role : 'faculty',
      action: 'MANUAL_ATTENDANCE_OVERRIDE',
      module: 'Attendance',
      description: `Modified attendance for ${student.name} (${student.registerNumber}) from [${oldStatus}] to [${newStatus}]. Reason: "${reason.trim()}"`,
      details: {
        studentId: student._id,
        registerNumber: student.registerNumber,
        oldStatus,
        newStatus,
        reason: reason.trim(),
      },
      ipAddress: req.ip || '',
    });

    res.status(200).json({
      success: true,
      message: `Manual override saved. Audit trail recorded.`,
      data: {
        student: student.name,
        oldStatus,
        newStatus,
        reason,
        modifiedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get Geolocation Check-in & Verification Attempt Logs (Failed & Successful)
 * @route GET /api/attendance/geo-logs
 */
exports.getGeoCheckinLogs = async (req, res, next) => {
  try {
    const { status, date, studentId, search } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (date) filter.date = date;
    if (studentId) filter.student = studentId;

    let logs = await GeoCheckinLog.find(filter)
      .sort({ createdAt: -1 })
      .populate('student', 'name registerNumber rollNumber department')
      .populate('department', 'name code')
      .limit(100);

    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.registerNumber.toLowerCase().includes(q) ||
          l.studentName.toLowerCase().includes(q) ||
          (l.failureReason && l.failureReason.toLowerCase().includes(q))
      );
    }

    const failedCount = logs.filter((l) => l.status.startsWith('FAILED')).length;
    const successCount = logs.filter((l) => l.status.startsWith('SUCCESS')).length;

    res.status(200).json({
      success: true,
      count: logs.length,
      failedAttemptsCount: failedCount,
      successfulAttemptsCount: successCount,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get attendance history & logs with percentage summaries
 * @route GET /api/attendance/history
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
 * @desc Get overall student attendance percentage summary for a class cohort
 * @route GET /api/attendance/summary
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
