const mongoose = require('mongoose');

/**
 * Role-Based Access Control Middleware
 *
 * Usage:
 *   router.get('/endpoint', authorize('admin', 'official'), handler);
 *
 * With ownership check (chainable):
 *   router.put('/:id', authorize('health_worker', 'official', 'admin').owner('WaterTest'), handler);
 *   router.delete('/:id', authorize('admin').owner('IssueReport'), handler);
 *
 * Ownership check skips for 'admin' and 'official' roles.
 * For 'health_worker', the resource's userId must match req.user._id.
 */
const authorize = (...roles) => {
  const roleCheck = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      console.warn(
        `[RBAC DENIED] User: ${req.user.email} | Role: ${req.user.role} | ` +
        `Resource: ${req.method} ${req.originalUrl} | ` +
        `Required: [${roles.join(', ')}]`
      );
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized for this action`,
      });
    }

    next();
  };

  roleCheck.owner = (modelName) => {
    const Model = mongoose.model(modelName);

    return async (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!roles.includes(req.user.role)) {
        console.warn(
          `[RBAC DENIED] User: ${req.user.email} | Role: ${req.user.role} | ` +
          `Resource: ${req.method} ${req.originalUrl} | ` +
          `Required: [${roles.join(', ')}]`
        );
        return res.status(403).json({
          message: `Role '${req.user.role}' is not authorized for this action`,
        });
      }

      if (req.user.role === 'admin' || req.user.role === 'official') {
        return next();
      }

      try {
        const resource = await Model.findById(req.params.id);
        if (!resource) {
          return res.status(404).json({ message: 'Resource not found' });
        }

        if (resource.userId.toString() !== req.user._id.toString()) {
          console.warn(
            `[OWNERSHIP DENIED] User: ${req.user.email} | ` +
            `Resource: ${modelName} ${req.params.id} | ` +
            `Owner: ${resource.userId}`
          );
          return res.status(403).json({
            message: 'You can only modify your own resources',
          });
        }

        req.resource = resource;
        next();
      } catch (error) {
        next(error);
      }
    };
  };

  return roleCheck;
};

module.exports = authorize;
