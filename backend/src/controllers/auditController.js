const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs
// @route   GET /api/v1/audit
// @access  Private (Admin only)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .populate('performedBy', 'name role email')
      .sort({ timestamp: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await AuditLog.countDocuments();

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
