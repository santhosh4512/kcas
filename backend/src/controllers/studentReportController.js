const StudentReport = require('../models/StudentReport');
const Student = require('../models/Student');
const AuditLog = require('../models/AuditLog');

// Helper to resolve student for student user
async function resolveStudentId(req) {
  if (req.user.referenceId) return req.user.referenceId;
  const s = await Student.findOne({ email: req.user.email });
  return s ? s._id : null;
}

/**
 * @desc Get student reports / issues
 * @route GET /api/student-reports
 * @access Private
 */
exports.getStudentReports = async (req, res, next) => {
  try {
    const { category, status, search, studentId } = req.query;
    const filter = {};

    // Privacy rule: Student role can ONLY view own reports
    if (req.user.role === 'student') {
      const myId = await resolveStudentId(req);
      filter.student = myId;
    } else {
      if (studentId) filter.student = studentId;
    }

    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;

    let reports = await StudentReport.find(filter)
      .populate('student', 'name registerNumber email phone photoUrl')
      .populate('department', 'name code')
      .populate('resolvedBy', 'name designation')
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      reports = reports.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.studentName.toLowerCase().includes(q) ||
          r.registerNumber.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Submit new student report / grievance issue
 * @route POST /api/student-reports
 * @access Private
 */
exports.submitStudentReport = async (req, res, next) => {
  try {
    const { category, title, description, attachmentUrl } = req.body;

    if (!category || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category, Title, and Description are required fields.',
      });
    }

    let studentId;
    let student;

    if (req.user.role === 'student') {
      studentId = await resolveStudentId(req);
      student = await Student.findById(studentId).populate('department');
    } else {
      studentId = req.body.studentId || (await resolveStudentId(req));
      student = await Student.findById(studentId).populate('department');
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    const report = await StudentReport.create({
      student: student._id,
      studentName: student.name,
      registerNumber: student.registerNumber,
      department: student.department ? student.department._id : null,
      category,
      title: title.trim(),
      description: description.trim(),
      attachmentUrl: attachmentUrl || '',
      date: new Date().toISOString().split('T')[0],
      status: 'Submitted',
    });

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        performedBy: req.user._id,
        performerName: student.name,
        performerRole: req.user.role,
        action: 'SUBMIT_STUDENT_REPORT',
        module: 'Student Reports',
        description: `Student ${student.name} (${student.registerNumber}) submitted issue: "${title}" [${category}]`,
        entityId: report._id.toString(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Your report has been submitted successfully and assigned to faculty review.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update report status & resolution notes (Faculty / Admin only)
 * @route PATCH /api/student-reports/:id
 * @access Private/Faculty/Admin
 */
exports.updateStudentReportStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;

    const report = await StudentReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Student report not found.' });
    }

    if (status) report.status = status;
    if (resolutionNotes !== undefined) report.resolutionNotes = resolutionNotes.trim();

    if (status === 'Resolved' || status === 'Rejected') {
      report.resolvedBy = req.user._id;
      report.resolverName = req.user.name;
      report.resolvedAt = new Date();
    }

    await report.save();

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        performedBy: req.user._id,
        performerName: req.user.name,
        performerRole: req.user.role,
        action: 'UPDATE_STUDENT_REPORT',
        module: 'Student Reports',
        description: `Updated student report for ${report.studentName} to status: ${report.status}`,
        entityId: report._id.toString(),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student report status updated successfully.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
