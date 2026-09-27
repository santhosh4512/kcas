const Notice = require('../models/Notice');
const AuditLog = require('../models/AuditLog');

/**
 * @desc Get all notices (with optional category, audience, priority filters)
 * @route GET /api/notices
 */
exports.getNotices = async (req, res, next) => {
  try {
    const { category, priority, audience, department, isPinned, search } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (priority && priority !== 'all') filter.priority = priority;
    if (isPinned !== undefined) filter.isPinned = isPinned === 'true';

    if (audience && audience !== 'All') {
      filter.targetAudience = { $in: ['All', audience] };
    }

    if (department) {
      filter.$or = [{ department: null }, { department }];
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const notices = await Notice.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .populate('department', 'name code')
      .populate('postedBy', 'name role email');

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get single notice
 * @route GET /api/notices/:id
 */
exports.getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('department', 'name code')
      .populate('postedBy', 'name role email');

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    res.status(200).json({ success: true, data: notice });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Create new notice
 * @route POST /api/notices
 */
exports.createNotice = async (req, res, next) => {
  try {
    const { title, content, category, priority, targetAudience, department, isPinned, expiresAt, attachments } = req.body;

    const notice = await Notice.create({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Normal',
      targetAudience: targetAudience || 'All',
      department: department || null,
      isPinned: Boolean(isPinned),
      expiresAt: expiresAt || null,
      attachments: attachments || [],
      postedBy: req.user ? req.user._id : null,
      postedByName: req.user ? req.user.name : 'College Administrator',
    });

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        performedBy: req.user._id,
        performerName: req.user.name,
        performerRole: req.user.role,
        action: 'CREATE_NOTICE',
        module: 'Notice Board',
        description: `Published notice: "${title}" [${category || 'General'}]`,
        ipAddress: req.ip || '',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: notice,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update notice
 * @route PUT /api/notices/:id
 */
exports.updateNotice = async (req, res, next) => {
  try {
    let notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        performedBy: req.user._id,
        performerName: req.user.name,
        performerRole: req.user.role,
        action: 'UPDATE_NOTICE',
        module: 'Notice Board',
        description: `Updated notice: "${notice.title}"`,
        ipAddress: req.ip || '',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      data: notice,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Delete notice
 * @route DELETE /api/notices/:id
 */
exports.deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await notice.deleteOne();

    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        performedBy: req.user._id,
        performerName: req.user.name,
        performerRole: req.user.role,
        action: 'DELETE_NOTICE',
        module: 'Notice Board',
        description: `Deleted notice: "${notice.title}"`,
        ipAddress: req.ip || '',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
