const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const crypto = require('crypto');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return errorResponse(res, 'All fields are required', 400);

    const existing = await User.findOne({ email });
    if (existing) return errorResponse(res, 'Email already registered', 400);

    const user = await User.create({ name, email, password });

    await AuditLog.create({
      user: user._id, action: 'REGISTER', ipAddress: req.ip,
      userAgent: req.headers['user-agent'], status: 'success',
    });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, 'Registration successful', { user, accessToken }, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return errorResponse(res, 'Email and password required', 400);

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) return errorResponse(res, 'Account deactivated', 403);

    user.lastLogin = new Date();
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    await AuditLog.create({
      user: user._id, action: 'LOGIN', ipAddress: req.ip,
      userAgent: req.headers['user-agent'], status: 'success',
    });

    const accessToken = generateAccessToken(user._id, user.role);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, 'Login successful', { user, accessToken });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.clearCookie('refreshToken');
    return successResponse(res, 'Logged out successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return errorResponse(res, 'No refresh token', 401);

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) return errorResponse(res, 'Invalid refresh token', 401);

    const accessToken = generateAccessToken(user._id, user.role);
    return successResponse(res, 'Token refreshed', { accessToken });
  } catch (err) {
    return errorResponse(res, 'Refresh token expired, please login again', 401);
  }
};

const getMe = async (req, res) => {
  return successResponse(res, 'User profile', req.user);
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id, { name, avatar }, { new: true, runValidators: true }
    );
    return successResponse(res, 'Profile updated', user);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return errorResponse(res, 'Current password incorrect', 400);
    }
    user.password = newPassword;
    await user.save();
    return successResponse(res, 'Password changed successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { register, login, logout, refreshToken, getMe, updateProfile, changePassword };
