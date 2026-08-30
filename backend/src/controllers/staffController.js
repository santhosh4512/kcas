const User = require('../models/User');
const Faculty = require('../models/Faculty');
const AuditLog = require('../models/AuditLog');

// @desc    Get all staff/faculty accounts (Admin only)
// @route   GET /api/staff
// @access  Private/Admin
exports.getStaffAccounts = async (req, res, next) => {
  try {
    const staffAccounts = await User.find({ role: 'faculty' })
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: staffAccounts.length,
      data: staffAccounts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin creates a Staff/Faculty Login Account with Temporary Password & Permissions
// @route   POST /api/staff
// @access  Private/Admin
exports.createStaffAccount = async (req, res, next) => {
  try {
    const {
      name,
      employeeId,
      email,
      temporaryPassword,
      department,
      designation,
      qualification,
      permissions,
      status,
    } = req.body;

    if (!name || !employeeId || !email || !temporaryPassword) {
      return res.status(400).json({
        success: false,
        message: 'Name, Employee ID, Email, and Temporary Password are required.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with email ${email} already exists.`,
      });
    }

    const defaultPermissions = [
      'view_students',
      'view_attendance',
      'manage_attendance',
      'view_marks',
      'manage_marks',
      'view_talent',
      'manage_talent',
      'view_reports',
    ];

    // Create User with Faculty role, temporary password and mustChangePassword = true
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: temporaryPassword,
      role: 'faculty',
      employeeId: employeeId.toUpperCase(),
      designation: designation || 'Assistant Professor',
      department: department || null,
      permissions: permissions && permissions.length > 0 ? permissions : defaultPermissions,
      status: status || 'Active',
      mustChangePassword: true,
    });

    // Also sync or create entry in Faculty directory if not exists
    let faculty = await Faculty.findOne({
      $or: [{ employeeId: employeeId.toUpperCase() }, { email: email.toLowerCase() }],
    });

    if (!faculty) {
      const Department = require('../models/Department');
      let targetDept = department;
      if (!targetDept) {
        const firstDept = await Department.findOne();
        targetDept = firstDept?._id;
      }

      if (targetDept) {
        faculty = await Faculty.create({
          facultyId: `FAC-${Date.now().toString().slice(-5)}`,
          name: name,
          employeeId: employeeId.toUpperCase(),
          email: email.toLowerCase(),
          phone: '9488029091',
          designation: designation || 'Assistant Professor',
          qualification: qualification || 'M.Sc., M.Phil., Ph.D.',
          department: targetDept,
          status: status || 'Active',
        });
      }
    }

    if (faculty) {
      user.referenceId = faculty._id;
      user.roleRefModel = 'Faculty';
      await user.save();
    }

    // Log admin action in Audit Log
    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE_STAFF_ACCOUNT',
      module: 'STAFF_MANAGEMENT',
      description: `Admin created staff login account for ${name} (${employeeId}) with temporary credentials`,
      targetId: user._id,
    });

    res.status(201).json({
      success: true,
      message: `Staff account for ${name} created successfully! Temporary credentials generated.`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        designation: user.designation,
        permissions: user.permissions,
        status: user.status,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Staff Account details & permissions (Admin only)
// @route   PUT /api/staff/:id
// @access  Private/Admin
exports.updateStaffAccount = async (req, res, next) => {
  try {
    const { name, designation, department, permissions, status } = req.body;

    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'faculty') {
      return res.status(404).json({ success: false, message: 'Staff account not found.' });
    }

    if (name) user.name = name;
    if (designation) user.designation = designation;
    if (department !== undefined) user.department = department;
    if (permissions) user.permissions = permissions;
    if (status) user.status = status;

    await user.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE_STAFF_ACCOUNT',
      module: 'STAFF_MANAGEMENT',
      description: `Admin updated permissions and details for staff ${user.name} (${user.email})`,
      targetId: user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Staff account and permissions updated successfully.',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin Reset Staff Temporary Password
// @route   POST /api/staff/:id/reset-password
// @access  Private/Admin
exports.resetStaffPassword = async (req, res, next) => {
  try {
    const { temporaryPassword } = req.body;

    if (!temporaryPassword || temporaryPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid temporary password of at least 6 characters.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'faculty') {
      return res.status(404).json({ success: false, message: 'Staff account not found.' });
    }

    user.password = temporaryPassword;
    user.mustChangePassword = true;
    await user.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'RESET_STAFF_PASSWORD',
      module: 'STAFF_MANAGEMENT',
      description: `Admin reset password for staff member ${user.name} (${user.email})`,
      targetId: user._id,
    });

    res.status(200).json({
      success: true,
      message: `Temporary password reset for ${user.name}. They will be prompted to change password on next login.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Staff Activation / Deactivation
// @route   PATCH /api/staff/:id/toggle-status
// @access  Private/Admin
exports.toggleStaffStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'faculty') {
      return res.status(404).json({ success: false, message: 'Staff account not found.' });
    }

    user.status = user.status === 'Active' ? 'Inactive' : 'Active';
    await user.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'TOGGLE_STAFF_STATUS',
      module: 'STAFF_MANAGEMENT',
      description: `Admin set status of staff ${user.name} to ${user.status}`,
      targetId: user._id,
    });

    res.status(200).json({
      success: true,
      message: `Staff account status changed to ${user.status}.`,
      status: user.status,
    });
  } catch (err) {
    next(err);
  }
};
