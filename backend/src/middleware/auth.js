const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - JWT verification
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Institutional authorization token is required.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'kcas_super_secure_jwt_secret_key_2026_tier1'
    );

    const user = await User.findById(decoded.id).populate('department');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account associated with this session token no longer exists.',
      });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by the Institutional Administrator.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session has expired or is invalid. Please log in again.',
    });
  }
};

// Role-based Access Control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role || 'Guest'}) is not authorized to access this resource.`,
      });
    }
    next();
  };
};

// Granular Permission Middleware
exports.checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Admins have full access across all capabilities
    if (req.user.role === 'admin') {
      return next();
    }

    const userPerms = req.user.permissions || [];
    const hasPerm = requiredPermissions.some((perm) => userPerms.includes(perm));

    if (!hasPerm) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required capability: [${requiredPermissions.join(', ')}]`,
      });
    }

    next();
  };
};
