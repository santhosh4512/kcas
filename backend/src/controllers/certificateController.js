const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const AuditLog = require('../models/AuditLog');

// Helper to resolve student
async function resolveStudent(req) {
  if (req.user.referenceId) {
    const s = await Student.findById(req.user.referenceId);
    if (s) return s;
  }
  const byEmail = await Student.findOne({ email: req.user.email });
  return byEmail;
}

/**
 * @desc Get current student's personal certificates
 * @route GET /api/certificates/me
 * @access Private (Student)
 */
exports.getMyCertificates = async (req, res, next) => {
  try {
    const student = await resolveStudent(req);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const certificates = await Certificate.find({ student: student._id })
      .sort({ createdAt: -1 })
      .populate('verifiedBy', 'name designation');

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all certificates (with filters by student, category, status)
 * @route GET /api/certificates
 */
exports.getCertificates = async (req, res, next) => {
  try {
    const { category, status, search, studentId } = req.query;
    const filter = {};

    // Privacy rule
    if (req.user.role === 'student') {
      const student = await resolveStudent(req);
      filter.student = student ? student._id : null;
    } else {
      if (studentId) filter.student = studentId;
    }

    if (category && category !== 'all') filter.category = category;
    if (status && status !== 'all') filter.verificationStatus = status;

    const certificates = await Certificate.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'student',
        select: 'name registerNumber rollNumber department year section email photoUrl',
        populate: { path: 'department', select: 'name code' },
      })
      .populate('verifiedBy', 'name role email');

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get certificate by ID
 * @route GET /api/certificates/:id
 */
exports.getCertificateById = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate('student', 'name registerNumber email department year section')
      .populate('verifiedBy', 'name role email');

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate record not found' });
    }

    // Privacy rule
    if (req.user.role === 'student') {
      const student = await resolveStudent(req);
      if (!student || String(student._id) !== String(cert.student?._id)) {
        return res.status(403).json({ success: false, message: 'Access Denied: You cannot view this certificate.' });
      }
    }

    res.status(200).json({ success: true, data: cert });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Upload/Create student certificate (Faculty / Admin / Student)
 * @route POST /api/certificates
 */
exports.createCertificate = async (req, res, next) => {
  try {
    const { studentId, title, category, issuer, issueDate, credentialId, credentialUrl, fileUrl, pointsAwarded } = req.body;

    let targetStudentId;
    if (req.user.role === 'student') {
      const s = await resolveStudent(req);
      targetStudentId = s ? s._id : null;
    } else {
      targetStudentId = studentId || (await resolveStudent(req))?._id;
    }

    if (!targetStudentId) {
      return res.status(400).json({ success: false, message: 'Student reference is required' });
    }

    const student = await Student.findById(targetStudentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const cert = await Certificate.create({
      student: targetStudentId,
      title,
      category: category || 'Technical',
      issuer: issuer || 'Authorized Institution',
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      credentialId: credentialId || '',
      credentialUrl: credentialUrl || '',
      fileUrl: fileUrl || '',
      pointsAwarded: Number(pointsAwarded) || 10,
      verificationStatus: req.user && (req.user.role === 'admin' || req.user.role === 'faculty') ? 'Verified' : 'Pending',
      verifiedBy: req.user && (req.user.role === 'admin' || req.user.role === 'faculty') ? req.user._id : null,
      verifiedAt: req.user && (req.user.role === 'admin' || req.user.role === 'faculty') ? new Date() : null,
    });

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        performedBy: req.user._id,
        performerName: req.user.name,
        performerRole: req.user.role,
        action: 'UPLOAD_CERTIFICATE',
        module: 'Certificates',
        description: `Uploaded certificate "${title}" for student ${student.name} (${student.registerNumber})`,
        ipAddress: req.ip || '',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Certificate submitted successfully',
      data: cert,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Verify or reject certificate (Faculty/Admin action)
 * @route PATCH /api/certificates/:id/verify
 */
exports.verifyCertificate = async (req, res, next) => {
  try {
    const { status, rejectionReason, pointsAwarded } = req.body;

    const cert = await Certificate.findById(req.params.id).populate('student', 'name registerNumber');
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    cert.verificationStatus = status;
    cert.verifiedBy = req.user ? req.user._id : null;
    cert.verifiedAt = new Date();

    if (status === 'Rejected') {
      cert.rejectionReason = rejectionReason || 'Information could not be verified.';
    } else if (status === 'Verified') {
      cert.rejectionReason = '';
      if (pointsAwarded !== undefined) cert.pointsAwarded = Number(pointsAwarded);
    }

    await cert.save();

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        performedBy: req.user._id,
        performerName: req.user.name,
        performerRole: req.user.role,
        action: 'VERIFY_CERTIFICATE',
        module: 'Certificates',
        description: `${status} certificate "${cert.title}" for ${cert.student ? cert.student.name : 'student'}`,
        ipAddress: req.ip || '',
      });
    }

    res.status(200).json({
      success: true,
      message: `Certificate has been marked as ${status}`,
      data: cert,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Delete certificate (Faculty / Admin only)
 * @route DELETE /api/certificates/:id
 */
exports.deleteCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    await cert.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
