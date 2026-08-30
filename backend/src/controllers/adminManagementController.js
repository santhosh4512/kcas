const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const MASTER_ADMIN_EMAIL = 'santhoshsiva754@gmail.com';

/**
 * @desc    Get all Admin users
 * @route   GET /api/admins
 * @access  Private (Admin Only)
 */
exports.getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single Admin user
 * @route   GET /api/admins/:id
 * @access  Private (Admin Only)
 */
exports.getAdminById = async (req, res, next) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: 'admin' }).select('-password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new Admin user
 * @route   POST /api/admins
 * @access  Private (Admin Only)
 */
exports.createAdmin = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      status = 'Active',
      profilePhoto = '',
      designation = 'Administrator',
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password for the admin account.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation does not match password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const admin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      password: password,
      role: 'admin', // Automatically and strictly set to admin
      status: status || 'Active',
      profilePhoto: profilePhoto || '',
      avatar: profilePhoto || '',
      designation: designation || 'Administrator',
      permissions: [
        'view_students',
        'edit_students',
        'view_attendance',
        'manage_attendance',
        'view_marks',
        'manage_marks',
        'view_talent',
        'manage_talent',
        'view_reports',
        'export_reports',
      ],
      mustChangePassword: false,
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'ADMIN_CREATED',
      module: 'ADMIN_MANAGEMENT',
      description: `Administrator ${req.user.email} created new Admin account for ${admin.email} (${admin.name})`,
      targetId: admin._id,
    });

    const populatedAdmin = await User.findById(admin._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'New Administrator account created successfully.',
      data: populatedAdmin,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Admin user details
 * @route   PUT /api/admins/:id
 * @access  Private (Admin Only)
 */
exports.updateAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    const { name, phone, designation, status, profilePhoto } = req.body;

    // Master Admin safety protection
    if (admin.email === MASTER_ADMIN_EMAIL && status === 'Inactive') {
      return res.status(400).json({
        success: false,
        message: 'Master Primary Admin account cannot be deactivated.',
      });
    }

    if (name) admin.name = name.trim();
    if (phone !== undefined) admin.phone = phone ? phone.trim() : '';
    if (designation) admin.designation = designation.trim();
    if (status) admin.status = status;
    if (profilePhoto !== undefined) {
      admin.profilePhoto = profilePhoto;
      admin.avatar = profilePhoto;
    }

    await admin.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'ADMIN_UPDATED',
      module: 'ADMIN_MANAGEMENT',
      description: `Administrator ${req.user.email} updated Admin profile for ${admin.email}`,
      targetId: admin._id,
    });

    const updated = await User.findById(admin._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Admin details updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Change Admin password by Admin
 * @route   PUT /api/admins/:id/password
 * @access  Private (Admin Only)
 */
exports.changeAdminPassword = async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters in length.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation does not match.',
      });
    }

    const admin = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    admin.password = password;
    await admin.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'ADMIN_PASSWORD_RESET',
      module: 'ADMIN_MANAGEMENT',
      description: `Administrator ${req.user.email} updated password for Admin ${admin.email}`,
      targetId: admin._id,
    });

    res.status(200).json({
      success: true,
      message: `Password updated successfully for ${admin.name}.`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle Admin active/inactive status
 * @route   PATCH /api/admins/:id/toggle-status
 * @access  Private (Admin Only)
 */
exports.toggleAdminStatus = async (req, res, next) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    if (admin.email === MASTER_ADMIN_EMAIL) {
      return res.status(400).json({
        success: false,
        message: 'Master Primary Admin account cannot be deactivated.',
      });
    }

    if (admin._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own active session account.',
      });
    }

    admin.status = admin.status === 'Active' ? 'Inactive' : 'Active';
    await admin.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'ADMIN_STATUS_TOGGLED',
      module: 'ADMIN_MANAGEMENT',
      description: `Administrator ${req.user.email} changed status of Admin ${admin.email} to ${admin.status}`,
      targetId: admin._id,
    });

    res.status(200).json({
      success: true,
      message: `Admin account status changed to ${admin.status}.`,
      status: admin.status,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete Admin user
 * @route   DELETE /api/admins/:id
 * @access  Private (Admin Only)
 */
exports.deleteAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    if (admin.email === MASTER_ADMIN_EMAIL) {
      return res.status(400).json({
        success: false,
        message: 'Master Primary Admin account cannot be deleted.',
      });
    }

    if (admin._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own active session account.',
      });
    }

    await User.findByIdAndDelete(admin._id);

    await AuditLog.create({
      user: req.user._id,
      action: 'ADMIN_DELETED',
      module: 'ADMIN_MANAGEMENT',
      description: `Administrator ${req.user.email} deleted Admin account ${admin.email} (${admin.name})`,
      targetId: admin._id,
    });

    res.status(200).json({
      success: true,
      message: `Admin account (${admin.name}) removed successfully.`,
    });
  } catch (err) {
    next(err);
  }
};
