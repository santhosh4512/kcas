const LocationAlert = require('../models/LocationAlert');
const AuditLog = require('../models/AuditLog');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

/**
 * @desc Get all GPS Location Alerts (Role-filtered)
 * @route GET /api/location-alerts
 */
exports.getLocationAlerts = async (req, res, next) => {
  try {
    const { status, severity, department, course, date, search, page = 1, limit = 50 } = req.query;
    const query = {};

    // Role-based filtering
    if (req.user && req.user.role === 'faculty') {
      const facultyProfile = await Faculty.findOne({ email: req.user.email });
      if (facultyProfile) {
        query.$or = [
          { faculty: facultyProfile._id },
          { department: facultyProfile.department },
        ];
      }
    } else if (req.user && req.user.role === 'student') {
      const studentProfile = await Student.findOne({ email: req.user.email });
      if (studentProfile) {
        query.student = studentProfile._id;
      }
    }

    if (status && status !== 'All') query.status = status;
    if (severity && severity !== 'All') query.severity = severity;
    if (department && department !== 'All') query.department = department;
    if (course && course !== 'All') query.course = course;
    if (date) query.date = date;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { studentName: searchRegex },
        { registerNumber: searchRegex },
        { facultyName: searchRegex },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await LocationAlert.countDocuments(query);

    const alerts = await LocationAlert.find(query)
      .populate('student', 'name registerNumber rollNumber email phone photo parentName parentPhone')
      .populate('department', 'name code')
      .populate('course', 'courseName courseCode')
      .populate('faculty', 'name employeeId designation email phone')
      .populate('subject', 'subjectName subjectCode')
      .populate('reviewedBy', 'name role email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Summary counts
    const unreadCount = await LocationAlert.countDocuments({ ...query, status: 'Unread' });
    const highSeverityCount = await LocationAlert.countDocuments({ ...query, severity: 'High' });
    const resolvedCount = await LocationAlert.countDocuments({ ...query, status: 'Resolved' });

    res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      summary: {
        total,
        unread: unreadCount,
        highSeverity: highSeverityCount,
        resolved: resolvedCount,
      },
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single Location Alert details
 * @route GET /api/location-alerts/:id
 */
exports.getLocationAlertById = async (req, res, next) => {
  try {
    const alert = await LocationAlert.findById(req.params.id)
      .populate('student')
      .populate('department')
      .populate('course')
      .populate('faculty')
      .populate('subject')
      .populate('reviewedBy', 'name role email');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Location alert not found' });
    }

    // Auto mark as Read if currently Unread
    if (alert.status === 'Unread') {
      alert.status = 'Read';
      alert.isRead = true;
      await alert.save();
    }

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update Location Alert Status (Review / Resolve / Dismiss)
 * @route PATCH /api/location-alerts/:id/status
 */
exports.updateLocationAlertStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;

    if (!status || !['Read', 'Under Review', 'Resolved', 'Dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required: Read, Under Review, Resolved, or Dismissed.',
      });
    }

    const alert = await LocationAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Location alert not found' });
    }

    const oldStatus = alert.status;
    alert.status = status;
    alert.isRead = true;
    alert.reviewedBy = req.user ? req.user._id : null;
    alert.reviewedByName = req.user ? req.user.name : 'System Staff';
    alert.reviewedAt = new Date();
    if (resolutionNotes) {
      alert.resolutionNotes = resolutionNotes;
    }

    await alert.save();

    // Log action to Audit Trail
    await AuditLog.create({
      user: req.user ? req.user._id : null,
      performedBy: req.user ? req.user._id : null,
      performerName: req.user ? req.user.name : 'Staff',
      performerRole: req.user ? req.user.role : 'faculty',
      action: `GPS_ALERT_${status.toUpperCase().replace(/\s+/g, '_')}`,
      module: 'GPS Location Alerts',
      description: `GPS Alert for ${alert.studentName} (${alert.registerNumber}) updated from [${oldStatus}] to [${status}]. Notes: "${resolutionNotes || 'No notes provided'}"`,
      entityId: alert._id.toString(),
      details: {
        alertId: alert._id,
        studentId: alert.student,
        registerNumber: alert.registerNumber,
        oldStatus,
        newStatus: status,
        distanceMeters: alert.distanceFromCampusMeters,
        notes: resolutionNotes || '',
      },
      ipAddress: req.ip || '',
    });

    res.status(200).json({
      success: true,
      message: `Alert marked as ${status} successfully.`,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};
