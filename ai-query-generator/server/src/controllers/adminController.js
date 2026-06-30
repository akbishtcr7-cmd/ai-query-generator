const PendingQuery = require('../models/PendingQuery');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const QueryHistory = require('../models/QueryHistory');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getPendingQueries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'pending' } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await PendingQuery.countDocuments(filter);
    const queries = await PendingQuery.find(filter)
      .populate('user', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return successResponse(res, 'Pending queries', { queries, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const reviewQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, adminNotes, modifiedQuery } = req.body;

    if (!['approved', 'rejected', 'modified'].includes(action)) {
      return errorResponse(res, 'Invalid action', 400);
    }

    const pending = await PendingQuery.findById(id).populate('user', 'name email');
    if (!pending) return errorResponse(res, 'Pending query not found', 404);

    pending.status = action;
    pending.reviewedBy = req.user._id;
    pending.reviewedAt = new Date();
    pending.adminNotes = adminNotes;
    if (modifiedQuery) pending.modifiedQuery = modifiedQuery;
    await pending.save();

    await AuditLog.create({
      user: req.user._id,
      action: `QUERY_${action.toUpperCase()}`,
      query: modifiedQuery || pending.generatedQuery,
      databaseType: pending.databaseType,
      ipAddress: req.ip,
      status: 'success',
      approvedBy: req.user._id,
      details: { pendingQueryId: id, originalUser: pending.user._id, adminNotes },
    });

    return successResponse(res, `Query ${action} successfully`, pending);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, status, userId } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (status) filter.status = status;
    if (userId) filter.user = userId;

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('user', 'name email role')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return successResponse(res, 'Audit logs', { logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return successResponse(res, 'All users', { users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin', 'superadmin'].includes(role)) return errorResponse(res, 'Invalid role', 400);

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return errorResponse(res, 'User not found', 404);

    await AuditLog.create({
      user: req.user._id, action: 'USER_ROLE_UPDATED', ipAddress: req.ip, status: 'success',
      details: { targetUser: id, newRole: role },
    });

    return successResponse(res, 'User role updated', user);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return errorResponse(res, 'User not found', 404);

    user.isActive = !user.isActive;
    await user.save();

    return successResponse(res, `User ${user.isActive ? 'activated' : 'deactivated'}`, user);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalQueries, pendingCount, blockedCount, recentLogs] = await Promise.all([
      User.countDocuments(),
      QueryHistory.countDocuments(),
      PendingQuery.countDocuments({ status: 'pending' }),
      AuditLog.countDocuments({ status: 'blocked' }),
      AuditLog.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10),
    ]);

    const dbUsage = await QueryHistory.aggregate([
      { $group: { _id: '$databaseType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 7 },
    ]);

    return successResponse(res, 'Admin stats', {
      totalUsers, totalQueries, pendingCount, blockedCount, dbUsage, userGrowth, recentLogs,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { getPendingQueries, reviewQuery, getAuditLogs, getAllUsers, updateUserRole, toggleUserStatus, getAdminStats };
