const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'kcas_super_secure_jwt_secret_key_2026_tier1',
    {
      expiresIn: '7d',
    }
  );
};

// @desc    Public User Registration (Locked to Student role only)
// @route   POST /api/auth/register-public
// @access  Public
exports.publicRegister = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
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
        message: 'Passwords do not match.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // STRICT SECURITY: Public registration is locked to STUDENT role only.
    // Never allow choosing Admin or Faculty through public registration.
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'student',
      status: 'Active',
      mustChangePassword: false,
      permissions: [],
    });

    const token = generateToken(user._id);

    // Audit log
    await AuditLog.create({
      user: user._id,
      action: 'USER_REGISTERED',
      module: 'AUTH',
      description: `Public registration for student account: ${user.email}`,
      targetId: user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to KCAS portal.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        mustChangePassword: false,
        permissions: [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate User & Issue Token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail })
      .select('+password')
      .populate('department');

    // Auto-heal / Auto-create Master Admin if requested and not found
    if (!user && cleanEmail === 'santhoshsiva754@gmail.com') {
      const Department = require('../models/Department');
      const firstDept = await Department.findOne({});
      user = await User.create({
        name: 'Santhosh Siva (System Administrator)',
        email: 'santhoshsiva754@gmail.com',
        password: password.length >= 6 ? password : 'admin123',
        role: 'admin',
        department: firstDept ? firstDept._id : null,
        designation: 'Chief Administrator & Systems Head',
        status: 'Active',
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
      });
      user = await User.findById(user._id).select('+password').populate('department');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated by the Administrator.',
      });
    }

    let isMatch = await user.comparePassword(password);
    
    // Fallback password checks for standard demo/admin/faculty accounts
    if (!isMatch) {
      if (cleanEmail === 'santhoshsiva754@gmail.com') {
        if (['12345678', 'admin123', 'admin'].includes(password)) {
          user.password = password.length >= 6 ? password : 'admin123';
          await user.save();
          isMatch = true;
        }
      } else if (cleanEmail === 'faculty@kcas.edu.in' || cleanEmail === 'kanimozhi@kcas.edu.in') {
        if (['faculty123', '12345678', 'admin123'].includes(password)) {
          user.password = password;
          await user.save();
          isMatch = true;
        }
      } else if (cleanEmail === 'student@kcas.edu.in' || cleanEmail === 'vinodhini@kcas.edu.in') {
        if (['student123', '12345678'].includes(password)) {
          user.password = password;
          await user.save();
          isMatch = true;
        }
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }


    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    // Audit log
    await AuditLog.create({
      user: user._id,
      action: 'USER_LOGIN',
      module: 'AUTH',
      description: `User ${user.email} (${user.role}) logged in successfully`,
      targetId: user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.department,
        designation: user.designation,
        employeeId: user.employeeId,
        mustChangePassword: Boolean(user.mustChangePassword),
        permissions: user.permissions || [],
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    First-Login Mandatory Password Reset
// @route   POST /api/auth/change-first-password
// @access  Private
exports.changeFirstPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current temporary password and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters in length.',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password confirmation does not match.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current temporary password is incorrect.',
      });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'FIRST_PASSWORD_RESET',
      module: 'AUTH',
      description: `Staff member ${user.email} updated temporary password to custom secure password`,
      targetId: user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully! Welcome to your dashboard.',
      mustChangePassword: false,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Standard Change Password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters in length.',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password confirmation does not match.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'PASSWORD_UPDATED',
      module: 'AUTH',
      description: `User ${user.email} updated their account password`,
      targetId: user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Current Logged in User Profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('department');
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Profile Details and Avatar / Profile Photo
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, designation, avatar, profilePhoto } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (designation) user.designation = designation.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (profilePhoto && !avatar) user.avatar = profilePhoto;
    if (avatar && !profilePhoto) user.profilePhoto = avatar;

    await user.save();

    // If user is linked to Faculty profile, sync profilePhoto on Faculty
    if (user.role === 'faculty' || user.referenceId) {
      const Faculty = require('../models/Faculty');
      await Faculty.updateMany(
        { $or: [{ email: user.email }, { _id: user.referenceId }] },
        { profilePhoto: user.profilePhoto || user.avatar }
      );
    }

    await AuditLog.create({
      user: user._id,
      action: 'PROFILE_UPDATED',
      module: 'AUTH',
      description: `User ${user.email} updated profile information and photo`,
      targetId: user._id,
    });

    const populatedUser = await User.findById(user._id).populate('department');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: populatedUser,
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        status: populatedUser.status,
        department: populatedUser.department,
        designation: populatedUser.designation,
        employeeId: populatedUser.employeeId,
        avatar: populatedUser.avatar || populatedUser.profilePhoto || '',
        profilePhoto: populatedUser.profilePhoto || populatedUser.avatar || '',
        mustChangePassword: Boolean(populatedUser.mustChangePassword),
        permissions: populatedUser.permissions || [],
        lastLogin: populatedUser.lastLogin,
      },
    });
  } catch (err) {
    next(err);
  }
};

