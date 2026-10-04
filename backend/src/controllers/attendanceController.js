const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const GeoCheckinLog = require('../models/GeoCheckinLog');
const LocationAlert = require('../models/LocationAlert');
const SystemSetting = require('../models/SystemSetting');
const AuditLog = require('../models/AuditLog');
const { sendGpsAlertEmail } = require('../services/emailService');
const XLSX = require('xlsx');

// Exact Institutional Campus Coordinates (Kamban College of Arts and Science for Women)
const DEFAULT_CAMPUS_LAT = 12.1905865;
const DEFAULT_CAMPUS_LNG = 79.0837848;
const DEFAULT_GEOFENCE_RADIUS = 1000; // 1000 meters

// Accurate Haversine Geographic Distance Formula
function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in metres
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

// Helper to resolve student record for the authenticated user
async function resolveStudent(req) {
  if (req.user.referenceId) {
    const s = await Student.findById(req.user.referenceId).populate('department course mentor');
    if (s) return s;
  }
  const byEmail = await Student.findOne({ email: req.user.email }).populate('department course mentor');
  return byEmail;
}

/**
 * @desc Get current student's personal attendance summary & history
 * @route GET /api/attendance/me
 * @access Private (Student)
 */
exports.getMyAttendance = async (req, res, next) => {
  try {
    const student = await resolveStudent(req);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const todayDate = new Date().toISOString().split('T')[0];

    // Find all attendance records involving this student
    const attendanceDocs = await Attendance.find({ 'records.student': student._id })
      .populate('department', 'name code')
      .populate('course', 'courseName')
      .populate('subject', 'subjectName subjectCode')
      .sort({ date: -1 });

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let todayRecord = null;

    const history = [];

    attendanceDocs.forEach((doc) => {
      const rec = doc.records.find((r) => String(r.student) === String(student._id));
      if (rec) {
        if (rec.status === 'Present' || rec.status === 'On Duty') {
          presentCount++;
        } else if (rec.status === 'Late' || rec.status === 'Late Present') {
          presentCount++;
          lateCount++;
        } else {
          absentCount++;
        }

        const item = {
          date: doc.date,
          subject: doc.subject ? doc.subject.subjectName : 'Academic Class',
          subjectCode: doc.subject ? doc.subject.subjectCode : '',
          status: rec.status,
          checkInTime: rec.checkInTime || rec.remarks || '',
          lateReason: rec.lateReason || '',
          isGeoVerified: rec.isGeoVerified || false,
          distanceMeters: rec.geoCoordinates?.distanceMeters || null,
        };

        if (doc.date === todayDate && !todayRecord) {
          todayRecord = item;
        }

        history.push(item);
      }
    });

    const totalRecorded = presentCount + absentCount;
    const percentage = totalRecorded > 0 ? Math.round((presentCount / totalRecorded) * 1000) / 10 : (student.initialAttendance || 85);
    const status = percentage >= 75 ? 'Healthy (Eligible for Exams)' : percentage >= 65 ? 'Warning (Shortage Risk)' : 'Low (Condonation Required)';

    res.status(200).json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: student.name,
          registerNumber: student.registerNumber,
          department: student.department?.name,
          course: student.course?.courseName,
          semester: student.semester,
        },
        todayStatus: todayRecord ? todayRecord.status : 'Not Marked Yet',
        todayRecord,
        stats: {
          totalWorkingSessions: totalRecorded || 30,
          presentCount: presentCount || Math.round((percentage * 30) / 100),
          absentCount,
          lateCount,
          percentage,
          status,
        },
        history,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get attendance sheet for a specific class, subject and date
 * @route GET /api/attendance/sheet
 */
exports.getAttendanceSheet = async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Class attendance roster is restricted to faculty & admin.',
      });
    }

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
      let lateReason = '';
      let checkInTime = '';
      let distanceMeters = null;

      if (existingAttendance) {
        const found = existingAttendance.records.find((r) => String(r.student) === String(st._id));
        if (found) {
          status = found.status;
          remarks = found.remarks || '';
          isGeoVerified = found.isGeoVerified || false;
          verificationMethod = found.verificationMethod || 'MANUAL_FACULTY';
          isOverridden = found.isOverridden || false;
          overrideReason = found.overrideReason || '';
          lateReason = found.lateReason || '';
          checkInTime = found.checkInTime || '';
          distanceMeters = found.geoCoordinates?.distanceMeters || null;
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
        lateReason,
        checkInTime,
        distanceMeters,
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
 * @desc Save or Update attendance sheet (Faculty / Admin)
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
      if (r.status === 'Present' || r.status === 'On Duty' || r.status === 'Late' || r.status === 'Late Present') {
        presentCount++;
      } else {
        absentCount++;
      }
      return {
        student: r.studentId || r.student,
        registerNumber: r.registerNumber,
        status: r.status || 'Present',
        remarks: r.remarks || '',
        lateReason: r.lateReason || '',
        checkInTime: r.checkInTime || '',
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
 * @desc Geo-Verified Smart Attendance Check-in (GPS Check against Kamban College campus 1000m radius)
 * @route POST /api/attendance/geo-checkin
 */
exports.submitGeoCheckin = async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy, status = 'Present', lateReason, remarks } = req.body;

    // Student privacy: student can only check in for themselves
    let targetStudent;
    if (req.user.role === 'student') {
      targetStudent = await resolveStudent(req);
    } else {
      const studentId = req.body.studentId || req.user.referenceId;
      targetStudent = await Student.findById(studentId).populate('department course mentor');
    }

    if (!targetStudent) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const nowTimeObj = new Date();
    const nowTimeStr = nowTimeObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Determine if late arrival (attendance window begins at 9:00 AM; past 9:00 AM is late)
    const currentHour = nowTimeObj.getHours();
    const currentMin = nowTimeObj.getMinutes();
    const isPastNine = currentHour > 9 || (currentHour === 9 && currentMin > 5);

    // If late and student did not provide reason yet, prompt reason
    if (isPastNine && (!lateReason || !lateReason.trim())) {
      return res.status(422).json({
        success: false,
        requiresLateReason: true,
        message: 'You are marking attendance late. Please enter the reason for late arrival.',
      });
    }

    // 1. Fetch Dynamic System Settings
    let systemSettings = await SystemSetting.findOne({ key: 'SYSTEM_CONFIG' });
    const campusLat = systemSettings?.campusLatitude || DEFAULT_CAMPUS_LAT;
    const campusLng = systemSettings?.campusLongitude || DEFAULT_CAMPUS_LNG;
    const allowedRadius = systemSettings?.campusRadiusMeters || DEFAULT_GEOFENCE_RADIUS;
    const areAlertsEnabled = systemSettings ? systemSettings.locationAlertsEnabled : true;

    // Validate coordinates presence
    if (!latitude || !longitude) {
      await GeoCheckinLog.create({
        student: targetStudent._id,
        registerNumber: targetStudent.registerNumber,
        studentName: targetStudent.name,
        department: targetStudent.department ? targetStudent.department._id : null,
        date: todayDate,
        status: 'FAILED_PERMISSION_DENIED',
        failureReason: 'GPS Location Permission Denied or Not Provided',
        userCoordinates: { latitude: 0, longitude: 0, accuracy: 0 },
        campusCoordinates: { latitude: campusLat, longitude: campusLng },
        geofenceRadiusMeters: allowedRadius,
      });

      return res.status(400).json({
        success: false,
        message: 'GPS location access required. Please enable location permissions on your device.',
      });
    }

    // Calculate distance using Haversine formula
    const distanceMeters = calculateDistanceInMeters(Number(latitude), Number(longitude), campusLat, campusLng);
    const isWithinCampus = distanceMeters <= allowedRadius;

    if (!isWithinCampus) {
      const distanceKm = (distanceMeters / 1000).toFixed(2);

      // Record failed geolocation attempt
      await GeoCheckinLog.create({
        student: targetStudent._id,
        registerNumber: targetStudent.registerNumber,
        studentName: targetStudent.name,
        department: targetStudent.department ? targetStudent.department._id : null,
        date: todayDate,
        status: 'FAILED_OUT_OF_CAMPUS',
        attendanceStatus: 'Absent',
        userCoordinates: { latitude: Number(latitude), longitude: Number(longitude), accuracy: Number(accuracy) || 10 },
        campusCoordinates: { latitude: campusLat, longitude: campusLng },
        distanceFromCampusMeters: distanceMeters,
        geofenceRadiusMeters: allowedRadius,
        failureReason: `Outside permitted college location: ${distanceKm} km away from Kamban College campus (Max allowed: ${allowedRadius}m).`,
      });

      // Resolve faculty mentor
      let assignedFacultyId = null;
      let assignedFacultyName = 'Dr. S. Kanimozhi (Faculty Mentor)';
      let assignedFacultyEmail = 'faculty@kcas.edu.in';

      if (targetStudent.mentor && targetStudent.mentor._id) {
        assignedFacultyId = targetStudent.mentor._id;
        assignedFacultyName = targetStudent.mentor.name || assignedFacultyName;
        assignedFacultyEmail = targetStudent.mentor.email || assignedFacultyEmail;
      }

      const severity = distanceMeters > 5000 ? 'High' : distanceMeters > 2000 ? 'Medium' : 'Low';

      let locationAlert = null;
      if (areAlertsEnabled) {
        locationAlert = await LocationAlert.create({
          student: targetStudent._id,
          studentName: targetStudent.name,
          registerNumber: targetStudent.registerNumber,
          department: targetStudent.department ? targetStudent.department._id : null,
          course: targetStudent.course ? targetStudent.course._id : null,
          year: targetStudent.year || 'I Year',
          semester: targetStudent.semester || 'Semester 1',
          section: targetStudent.section || 'A',
          faculty: assignedFacultyId,
          facultyName: assignedFacultyName,
          userCoordinates: {
            latitude: Number(latitude),
            longitude: Number(longitude),
            accuracy: Number(accuracy) || 10,
          },
          campusCoordinates: {
            latitude: campusLat,
            longitude: campusLng,
          },
          distanceFromCampusMeters: distanceMeters,
          allowedRadiusMeters: allowedRadius,
          date: todayDate,
          time: nowTimeStr,
          locationStatus: 'Outside permitted location',
          attendanceAttemptStatus: 'Rejected - Outside Permitted Location',
          severity,
          status: 'Unread',
          isRead: false,
        });

        // Trigger real email notification
        await sendGpsAlertEmail({
          studentName: targetStudent.name,
          registerNumber: targetStudent.registerNumber,
          departmentName: targetStudent.department?.name || 'Computer Science',
          date: todayDate,
          time: nowTimeStr,
          distanceMeters,
          allowedRadius,
          gpsStatus: 'Outside Permitted Location',
          alertType: 'ATTENDANCE_LOCATION_VIOLATION',
          recipientEmail: assignedFacultyEmail,
          facultyName: assignedFacultyName,
        });

        await AuditLog.create({
          user: req.user ? req.user._id : null,
          performedBy: req.user ? req.user._id : null,
          performerName: targetStudent.name,
          performerRole: 'student',
          action: 'GPS_ATTENDANCE_REJECTED',
          module: 'GPS Attendance',
          description: `Attendance rejected for ${targetStudent.name} (${targetStudent.registerNumber}): Detected ${distanceKm} km outside permitted college location. Faculty alerted: ${assignedFacultyName}.`,
          entityId: locationAlert._id.toString(),
        });
      }

      return res.status(403).json({
        success: false,
        isGeoVerified: false,
        distanceMeters,
        allowedRadius,
        locationStatus: 'Outside permitted location',
        message: 'Attendance cannot be marked because you are outside the permitted college location.',
        alertCreated: Boolean(locationAlert),
      });
    }

    // SUCCESS: Student is within 1000 meters!
    const effectiveStatus = isPastNine ? 'Late Present' : (status || 'Present');

    await GeoCheckinLog.create({
      student: targetStudent._id,
      registerNumber: targetStudent.registerNumber,
      studentName: targetStudent.name,
      department: targetStudent.department ? targetStudent.department._id : null,
      date: todayDate,
      status: 'SUCCESS_IN_CAMPUS',
      attendanceStatus: effectiveStatus,
      userCoordinates: { latitude: Number(latitude), longitude: Number(longitude), accuracy: Number(accuracy) || 10 },
      campusCoordinates: { latitude: campusLat, longitude: campusLng },
      distanceFromCampusMeters: distanceMeters,
      geofenceRadiusMeters: allowedRadius,
      deviceInfo: req.headers['user-agent'] || 'Web Browser',
      ipAddress: req.ip || '',
    });

    // Update or create attendance entry for today
    let subject = await Subject.findOne({ department: targetStudent.department, semester: targetStudent.semester });
    if (!subject) {
      subject = await Subject.findOne();
    }

    if (subject) {
      let attendanceDoc = await Attendance.findOne({
        department: targetStudent.department,
        course: targetStudent.course,
        date: todayDate,
        section: targetStudent.section || 'A',
      });

      if (!attendanceDoc) {
        attendanceDoc = new Attendance({
          department: targetStudent.department,
          course: targetStudent.course,
          year: targetStudent.year,
          semester: targetStudent.semester,
          section: targetStudent.section || 'A',
          subject: subject._id,
          date: todayDate,
          records: [],
          totalStudents: 1,
          presentCount: 1,
          absentCount: 0,
        });
      }

      const recIndex = attendanceDoc.records.findIndex((r) => r.student.toString() === targetStudent._id.toString());
      const recordData = {
        student: targetStudent._id,
        registerNumber: targetStudent.registerNumber,
        status: effectiveStatus,
        remarks: remarks || (isPastNine ? `Late arrival: ${lateReason}` : 'Location Verified Check-in'),
        lateReason: isPastNine ? (lateReason || '').trim() : '',
        checkInTime: nowTimeStr,
        isGeoVerified: true,
        verificationMethod: 'GPS_CAMPUS',
        geoCoordinates: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          distanceMeters,
        },
      };

      if (recIndex >= 0) {
        attendanceDoc.records[recIndex] = { ...attendanceDoc.records[recIndex].toObject(), ...recordData };
      } else {
        attendanceDoc.records.push(recordData);
      }

      attendanceDoc.totalStudents = attendanceDoc.records.length;
      attendanceDoc.presentCount = attendanceDoc.records.filter((r) => r.status === 'Present' || r.status === 'On Duty' || r.status === 'Late' || r.status === 'Late Present').length;
      attendanceDoc.absentCount = attendanceDoc.records.length - attendanceDoc.presentCount;
      await attendanceDoc.save();
    }

    res.status(200).json({
      success: true,
      isGeoVerified: true,
      distanceMeters,
      allowedRadius,
      message: `Location Verified! Distance from College: ${distanceMeters} meters. Marked as ${effectiveStatus}.`,
      data: {
        student: targetStudent.name,
        registerNumber: targetStudent.registerNumber,
        date: todayDate,
        checkInTime: nowTimeStr,
        status: effectiveStatus,
        lateReason: isPastNine ? lateReason : undefined,
        distanceMeters,
        gpsVerified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Periodic College-Hour Geolocation Monitoring (9:00 AM - 2:30 PM)
 * @route POST /api/attendance/location-monitor
 */
exports.monitorCollegeHoursLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Coordinates missing' });
    }

    const student = await resolveStudent(req);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const nowTimeObj = new Date();
    const currentHour = nowTimeObj.getHours();
    const currentMin = nowTimeObj.getMinutes();

    // Only active during 9:00 AM to 2:30 PM (14:30)
    const isCollegeHours = (currentHour >= 9 && currentHour < 14) || (currentHour === 14 && currentMin <= 30);
    if (!isCollegeHours) {
      return res.status(200).json({ success: true, message: 'Outside college monitoring window (9:00 AM - 2:30 PM).' });
    }

    // Check distance
    const distanceMeters = calculateDistanceInMeters(Number(latitude), Number(longitude), DEFAULT_CAMPUS_LAT, DEFAULT_CAMPUS_LNG);
    if (distanceMeters > DEFAULT_GEOFENCE_RADIUS) {
      const nowTimeStr = nowTimeObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      // Check if alert already raised today in the last hour
      const recentAlert = await LocationAlert.findOne({
        student: student._id,
        date: todayDate,
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
      });

      if (!recentAlert) {
        const facName = student.mentor?.name || 'Dr. S. Kanimozhi (Faculty Mentor)';
        const facEmail = student.mentor?.email || 'faculty@kcas.edu.in';

        await LocationAlert.create({
          student: student._id,
          studentName: student.name,
          registerNumber: student.registerNumber,
          department: student.department ? student.department._id : null,
          course: student.course ? student.course._id : null,
          year: student.year || 'I Year',
          semester: student.semester || 'Semester 1',
          section: student.section || 'A',
          faculty: student.mentor ? student.mentor._id : null,
          facultyName: facName,
          userCoordinates: { latitude: Number(latitude), longitude: Number(longitude), accuracy: Number(accuracy) || 10 },
          campusCoordinates: { latitude: DEFAULT_CAMPUS_LAT, longitude: DEFAULT_CAMPUS_LNG },
          distanceFromCampusMeters: distanceMeters,
          allowedRadiusMeters: DEFAULT_GEOFENCE_RADIUS,
          date: todayDate,
          time: nowTimeStr,
          locationStatus: 'Detected Outside Campus During College Hours',
          attendanceAttemptStatus: 'Location Violation Alert',
          severity: 'High',
          status: 'Unread',
          isRead: false,
        });

        await sendGpsAlertEmail({
          studentName: student.name,
          registerNumber: student.registerNumber,
          departmentName: student.department?.name || 'Computer Science',
          date: todayDate,
          time: nowTimeStr,
          distanceMeters,
          allowedRadius: DEFAULT_GEOFENCE_RADIUS,
          gpsStatus: 'Outside College Boundary',
          alertType: 'CAMPUS_LEAVE_VIOLATION',
          recipientEmail: facEmail,
          facultyName: facName,
        });
      }

      return res.status(200).json({
        success: true,
        violationDetected: true,
        distanceMeters,
        message: 'Location alert logged for leaving campus area during college hours.',
      });
    }

    res.status(200).json({
      success: true,
      violationDetected: false,
      distanceMeters,
      message: 'Location verified inside permitted campus boundary.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Manual Attendance Override with Mandatory Audit Trail (Faculty / Admin)
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

    attendance.presentCount = attendance.records.filter((r) => r.status === 'Present' || r.status === 'On Duty' || r.status === 'Late' || r.status === 'Late Present').length;
    attendance.absentCount = attendance.records.length - attendance.presentCount;
    await attendance.save();

    await AuditLog.create({
      user: req.user ? req.user._id : null,
      performedBy: req.user ? req.user._id : null,
      performerName: req.user ? req.user.name : 'Authorized Staff',
      performerRole: req.user ? req.user.role : 'faculty',
      action: 'MANUAL_ATTENDANCE_OVERRIDE',
      module: 'Attendance',
      description: `Modified attendance for ${student.name} (${student.registerNumber}) from [${oldStatus}] to [${newStatus}]. Reason: "${reason.trim()}"`,
      details: { studentId: student._id, registerNumber: student.registerNumber, oldStatus, newStatus, reason: reason.trim() },
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
 * @desc Get Geolocation Check-in & Verification Attempt Logs
 * @route GET /api/attendance/geo-logs
 */
exports.getGeoCheckinLogs = async (req, res, next) => {
  try {
    const { status, date, search } = req.query;
    const filter = {};

    // If student role, filter strictly to own student id
    if (req.user.role === 'student') {
      const student = await resolveStudent(req);
      filter.student = student ? student._id : null;
    }

    if (status && status !== 'all') filter.status = status;
    if (date) filter.date = date;

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
 * @desc Get attendance history
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

    let history = await Attendance.find(query)
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode')
      .populate('subject', 'subjectName subjectCode')
      .populate('markedBy', 'name role')
      .sort({ date: -1 })
      .limit(50);

    // If student, filter records inside each sheet to only this student
    if (req.user.role === 'student') {
      const student = await resolveStudent(req);
      if (student) {
        history = history.filter((h) => h.records.some((r) => String(r.student) === String(student._id)));
      }
    }

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
 * @desc Get overall student attendance percentage summary
 * @route GET /api/attendance/summary
 */
exports.getAttendanceSummary = async (req, res, next) => {
  try {
    // If student role, return only own summary
    if (req.user.role === 'student') {
      const student = await resolveStudent(req);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found.' });
      }

      const attendanceDocs = await Attendance.find({ 'records.student': student._id });
      let presentCount = 0;
      let absentCount = 0;

      attendanceDocs.forEach((att) => {
        const rec = att.records.find((r) => String(r.student) === String(student._id));
        if (rec) {
          if (rec.status === 'Present' || rec.status === 'On Duty' || rec.status === 'Late' || rec.status === 'Late Present') {
            presentCount++;
          } else {
            absentCount++;
          }
        }
      });

      const totalRecorded = presentCount + absentCount;
      const percentage = totalRecorded > 0 ? Math.round((presentCount / totalRecorded) * 1000) / 10 : (student.initialAttendance || 85);
      const status = percentage >= 75 ? 'Healthy' : percentage >= 65 ? 'Warning' : 'Low';

      return res.status(200).json({
        success: true,
        totalStudents: 1,
        totalWorkingSessions: totalRecorded,
        data: [
          {
            studentId: student._id,
            registerNumber: student.registerNumber,
            rollNumber: student.rollNumber,
            name: student.name,
            department: student.department?.name || '',
            course: student.course?.courseName || '',
            year: student.year,
            section: student.section,
            totalSessions: totalRecorded,
            presentCount,
            absentCount,
            percentage,
            status,
          },
        ],
      });
    }

    // Faculty / Admin summary
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
          if (rec.status === 'Present' || rec.status === 'On Duty' || rec.status === 'Late' || rec.status === 'Late Present') {
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
