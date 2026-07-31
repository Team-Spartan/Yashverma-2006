const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs
// @route   GET /api/v1/audit
// @access  Private (Admin only)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const logs = await AuditLog.find()
      .populate('performedBy', 'name role email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await AuditLog.countDocuments();

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
