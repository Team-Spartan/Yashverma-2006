const mongoose = require('mongoose');

/**
 * Ownership Verification Middleware
 *
 * Verifies that the authenticated user owns the requested resource.
 * Admin and official roles bypass ownership checks.
 *
 * Usage:
 *   router.put('/:id', auth, ownership('WaterTest'), handler);
 *   router.delete('/:id', auth, ownership('IssueReport', 'reportedBy'), handler);
 *
 * @param {string} modelName - Mongoose model name
 * @param {string} ownerField - Field that references the owner (default: 'userId')
 */
const ownership = (modelName, ownerField = 'userId') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role === 'admin' || req.user.role === 'official') {
      return next();
    }

    try {
      const Model = mongoose.model(modelName);
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      if (resource[ownerField].toString() !== req.user._id.toString()) {
        console.warn(
          `[OWNERSHIP DENIED] User: ${req.user.email} | ` +
          `Resource: ${modelName} ${req.params.id} | ` +
          `Field: ${ownerField} | ` +
          `Owner: ${resource[ownerField]}`
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

module.exports = ownership;
