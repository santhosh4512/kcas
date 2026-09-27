const WarningAlert = require('../models/WarningAlert');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const AuditLog = require('../models/AuditLog');

/**
 * @desc Get all early warning alerts
 * @route GET /api/warnings
 */
exports.getWarningAlerts = async (req, res, next) => {
  try {
    const { status, severity, alertType, department, mentorId, search } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (severity && severity !== 'all') filter.severity = severity;
    if (alertType && alertType !== 'all') filter.alertType = alertType;
    if (department) filter.department = department;
    if (mentorId) filter.mentor = mentorId;

    let warnings = await WarningAlert.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'student',
        select: 'name registerNumber rollNumber email phone year semester section photoUrl',
        populate: { path: 'department', select: 'name code' },
      })
      .populate('department', 'name code')
      .populate('mentor', 'name email designation phone');

    if (search) {
      const q = search.toLowerCase();
      warnings = warnings.filter(
        (w) =>
          (w.student && (w.student.name.toLowerCase().includes(q) || w.student.registerNumber.toLowerCase().includes(q))) ||
          (w.reason && w.reason.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: warnings.length,
      data: warnings,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Run automated system scan to detect at-risk students & generate alerts
 * @route POST /api/warnings/scan
 */
exports.runEarlyWarningScan = async (req, res, next) => {
  try {
    const students = await Student.find({ status: 'Active' }).populate('department mentor');
    let generatedCount = 0;

    for (const student of students) {
      // 1. Calculate student attendance %
      const attendanceDocs = await Attendance.find({
        'records.student': student._id,
      });

      let totalSessions = 0;
      let presentSessions = 0;

      attendanceDocs.forEach((doc) => {
        const rec = doc.records.find((r) => r.student.toString() === student._id.toString());
        if (rec) {
          totalSessions++;
          if (rec.status === 'Present' || rec.status === 'On Duty') {
            presentSessions++;
          }
        }
      });

      const attendancePct = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

      // 2. Check low attendance alert (< 75%)
      if (totalSessions >= 5 && attendancePct < 75) {
        const existingAlert = await WarningAlert.findOne({
          student: student._id,
          alertType: 'Low Attendance',
          status: { $in: ['Active', 'Under Review', 'Parent Contacted'] },
        });

        if (!existingAlert) {
          await WarningAlert.create({
            student: student._id,
            studentName: student.name,
            registerNumber: student.registerNumber,
            department: student.department ? student.department._id : null,
            mentor: student.mentor ? student.mentor._id : null,
            alertType: 'Low Attendance',
            severity: attendancePct < 65 ? 'Critical' : 'High',
            attendancePercentage: attendancePct,
            reason: `Attendance dropped to ${attendancePct}% (${presentSessions}/${totalSessions} sessions). Requires mandatory mentor intervention.`,
            status: 'Active',
          });
          generatedCount++;
        }
      }

      // 3. Check marks / arrear failures
      const marksDocs = await Mark.find({
        'marks.student': student._id,
      });

      let failedSubjects = 0;
      let totalMarksAccum = 0;
      let countMarks = 0;

      marksDocs.forEach((doc) => {
        const m = doc.marks.find((mk) => mk.student.toString() === student._id.toString());
        if (m) {
          countMarks++;
          totalMarksAccum += m.totalMarks || 0;
          if ((m.totalMarks || 0) < 50) {
            failedSubjects++;
          }
        }
      });

      if (failedSubjects >= 2) {
        const existingMarkAlert = await WarningAlert.findOne({
          student: student._id,
          alertType: 'Academic Decline',
          status: { $in: ['Active', 'Under Review', 'Parent Contacted'] },
        });

        if (!existingMarkAlert) {
          await WarningAlert.create({
            student: student._id,
            studentName: student.name,
            registerNumber: student.registerNumber,
            department: student.department ? student.department._id : null,
            mentor: student.mentor ? student.mentor._id : null,
            alertType: 'Academic Decline',
            severity: failedSubjects >= 3 ? 'Critical' : 'High',
            failedSubjectsCount: failedSubjects,
            reason: `Student scored below 50% in ${failedSubjects} subjects. Academic counseling required.`,
            status: 'Active',
          });
          generatedCount++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Early Warning Scan completed. ${generatedCount} new alerts generated.`,
      generatedCount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Add mentor note or update status of warning alert
 * @route PATCH /api/warnings/:id/action
 */
exports.updateWarningAction = async (req, res, next) => {
  try {
    const { status, note, actionTaken } = req.body;
    const warning = await WarningAlert.findById(req.params.id);

    if (!warning) {
      return res.status(404).json({ success: false, message: 'Warning alert not found' });
    }

    if (status) {
      warning.status = status;
      if (status === 'Resolved') {
        warning.resolvedAt = new Date();
      }
    }

    if (actionTaken) {
      warning.actionTaken = actionTaken;
    }

    if (note && note.trim()) {
      warning.mentorNotes.push({
        note: note.trim(),
        addedBy: req.user ? req.user._id : null,
        authorName: req.user ? req.user.name : 'Faculty Mentor',
        createdAt: new Date(),
      });
    }

    await warning.save();

    res.status(200).json({
      success: true,
      message: 'Warning record updated successfully',
      data: warning,
    });
  } catch (err) {
    next(err);
  }
};
