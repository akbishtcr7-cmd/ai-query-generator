const { errorResponse } = require('../utils/responseHandler');

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, `Access denied. Required role: ${roles.join(' or ')}`, 403);
    }
    next();
  };
};

const isAdmin = requireRole('admin', 'superadmin');
const isSuperAdmin = requireRole('superadmin');

module.exports = { requireRole, isAdmin, isSuperAdmin };
