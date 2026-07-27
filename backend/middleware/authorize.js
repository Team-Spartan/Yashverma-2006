const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      console.warn(
        `[AUTHZ DENIED] User ${req.user.email} (role: ${req.user.role}) ` +
        `attempted access on ${req.method} ${req.originalUrl} ` +
        `(required roles: ${roles.join(', ')})`
      );
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized for this action`,
      });
    }

    next();
  };
};

module.exports = authorize;
