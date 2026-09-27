const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const AuditLog = require('../models/AuditLog');

/**
 * @desc Get all certificates (with filters by student, category, status)
 * @route GET /api/certificates
 */
exports.getCertificates = async (req, res, next) => {
  try {
    const { studentId, category, status, search } = req.query;
    const filter = {};

    if (studentId) filter.student = studentId;
    if (category && category !== 'all') filter.category = category;
    if (status && status !== 'all') filter.verificationStatus = status;

    let query = Certificate.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'student',
        select: 'name registerNumber rollNumber department year section email photoUrl',
        populate: { path: 'department', select: 'name code' },
      })
      .populate('verifiedBy', 'name role email');

    const certificates = await query;

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

    res.status(200).json({ success: true, data: cert });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Upload/Create student certificate
 * @route POST /api/certificates
 */
exports.createCertificate = async (req, res, next) => {
  try {
    const { studentId, title, category, issuer, issueDate, credentialId, credentialUrl, fileUrl, pointsAwarded } = req.body;
    const targetStudentId = studentId || (req.user && req.user.referenceId);

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
      verificationStatus: req.user && req.user.role === 'admin' ? 'Verified' : 'Pending',
      verifiedBy: req.user && req.user.role === 'admin' ? req.user._id : null,
      verifiedAt: req.user && req.user.role === 'admin' ? new Date() : null,
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
    const { status, rejectionReason, pointsAwarded } = req.body; // status: 'Verified' or 'Rejected'

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
 * @desc Delete certificate
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
