const AuditLog = require('../models/AuditLog');

// @desc    Get system audit logs (Admin only)
// @route   GET /api/audit-logs
// @access  Private/Admin
exports.getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const skip = (page - 1) * limit;

    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};
