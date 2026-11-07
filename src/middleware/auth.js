/**
 * src/middleware/auth.js
 * JWT verification middleware. Attaches decoded user payload to req.user.
 */

const jwt    = require('jsonwebtoken');
const config = require('../config');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Expect: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  console.log('[auth] Token present:', !!token);

  if (!token) {
    console.log('[auth] No token provided');
    return res.status(401).json({ error: 'Access token required.' });
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      console.error('[auth] Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    console.log('[auth] Token verified for user:', user.id);
    req.user = user; // { id, email, name, iat, exp }
    next();
  });
}

module.exports = { authenticateToken };
