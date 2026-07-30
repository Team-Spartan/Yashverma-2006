const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'jaldrishti-secret-key-2026-rural-water';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token is provided, attach a default guest or mock user for smooth developer experience
    req.user = {
      id: 'guest',
      name: 'Guest Observer',
      role: 'health_worker',
      village: 'Rampur'
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Fallback to guest payload on invalid token rather than hard crash
    req.user = {
      id: 'guest',
      name: 'Guest Observer',
      role: 'health_worker',
      village: 'Rampur'
    };
    next();
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || (roles.length > 0 && !roles.includes(req.user.role))) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of roles [${roles.join(', ')}]`
      });
    }
    next();
  };
};

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireRole
};
