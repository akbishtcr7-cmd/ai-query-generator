const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Verify Supabase JWT token from Authorization header.
 * Supabase signs JWTs with the JWT_SECRET (found in Project Settings > API > JWT Secret).
 * We verify it locally without calling Supabase on every request.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Not authorized, no token', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify using Supabase JWT secret
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    } catch {
      return errorResponse(res, 'Invalid or expired token', 401);
    }

    // decoded.sub = Supabase user UUID
    const supabaseId = decoded.sub;
    if (!supabaseId) return errorResponse(res, 'Token missing user ID', 401);

    // Find or auto-create a local User record linked to the Supabase UID
    let user = await User.findOne({ supabaseId });

    if (!user) {
      // First time this Supabase user hits the backend — create a local record
      const email = decoded.email || `${supabaseId}@unknown.com`;
      const name  = decoded.user_metadata?.full_name || email.split('@')[0];
      user = await User.create({ supabaseId, email, name, role: 'user' });
    }

    if (!user.isActive) return errorResponse(res, 'Account deactivated', 403);

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return errorResponse(res, 'Authentication failed', 401);
  }
};

module.exports = { protect };
