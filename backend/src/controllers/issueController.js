const IssueReport = require('../models/IssueReport');
const WaterSource = require('../models/WaterSource');

// @desc    Get all issue reports
// @route   GET /api/v1/issues
// @access  Private
exports.getIssues = async (req, res, next) => {
  try {
    const { status, severity, villageName } = req.query;

    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (villageName) query.villageName = villageName;

    const issues = await IssueReport.find(query)
      .populate('waterSource', 'name sourceType')
      .populate('reportedBy', 'name email role phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report a new issue
// @route   POST /api/v1/issues
// @access  Private
exports.createIssue = async (req, res, next) => {
  try {
    const { waterSourceId, issueType, severity, description } = req.body;

    const waterSource = await WaterSource.findById(waterSourceId);
    if (!waterSource) {
      return res.status(404).json({ success: false, message: 'Water source not found' });
    }

    const issue = await IssueReport.create({
      waterSource: waterSourceId,
      reportedBy: req.user._id,
      villageName: waterSource.villageName,
      issueType,
      severity,
      description
    });

    res.status(201).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue status & resolution
// @route   PATCH /api/v1/issues/:id
// @access  Private (Health Worker / Admin)
exports.updateIssueStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;

    let issue = await IssueReport.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const updateFields = { status };
    if (resolutionNotes) updateFields.resolutionNotes = resolutionNotes;
    if (status === 'resolved') updateFields.resolvedAt = new Date();

    issue = await IssueReport.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};
