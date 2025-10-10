const { verifyToken } = require('../services/supabaseService');

/**
 * Authentication middleware
 * Verifies the JWT token from the Authorization header
 * Adds user data to req.user if valid
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const user = await verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user data to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = { requireAuth };