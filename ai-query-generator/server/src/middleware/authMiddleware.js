const { jwtVerify, createRemoteJWKSet } = require('jose');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHandler');

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
);

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Not authorized, no token', 401);
    }

    const token = authHeader.split(' ')[1];

    let payload;
    try {
      const result = await jwtVerify(token, JWKS, {
        issuer: `${process.env.SUPABASE_URL}/auth/v1`,
      });
      payload = result.payload;
    } catch (err) {
      console.log('Verify error:', err.message);
      return errorResponse(res, 'Invalid or expired token', 401);
    }

    const supabaseId = payload.sub;
    if (!supabaseId) return errorResponse(res, 'Token missing user ID', 401);

    let user = await User.findOne({ supabaseId });
    if (!user) {
      const email = payload.email || `${supabaseId}@unknown.com`;
      const name = payload.user_metadata?.full_name || email.split('@')[0];
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