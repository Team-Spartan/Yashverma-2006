const mongoose = require('mongoose');
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

    const sourceIdVal = waterSourceId || req.body.waterSource;
    const issueTypeVal = issueType || req.body.type;

    // Explicit field validation
    if (!sourceIdVal) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a water source ID',
        error: 'Please provide a water source ID' 
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(sourceIdVal)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid water source ID format',
        error: 'Invalid water source ID format' 
      });
    }

    if (!issueTypeVal) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please specify the type of issue',
        error: 'Please specify the type of issue' 
      });
    }

    const issueTypeValLower = issueTypeVal.toString().toLowerCase().trim();
    const validIssueTypes = ['bad_odor', 'discoloration', 'pipe_leakage', 'contamination_outbreak', 'low_pressure', 'other'];
    if (!validIssueTypes.includes(issueTypeValLower)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid issue type',
        error: 'Invalid issue type' 
      });
    }

    if (!description || description.toString().trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Please describe the issue in detail',
        error: 'Please describe the issue in detail' 
      });
    }

    const severityVal = severity ? severity.toString().toLowerCase().trim() : 'medium';
    const validSeverities = ['low', 'medium', 'high', 'emergency'];
    if (severity && !validSeverities.includes(severityVal)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid severity level',
        error: 'Invalid severity level' 
      });
    }

    const waterSource = await WaterSource.findById(sourceIdVal);
    if (!waterSource) {
      return res.status(404).json({ 
        success: false, 
        message: 'Water source not found',
        error: 'Water source not found' 
      });
    }

    const issue = await IssueReport.create({
      waterSource: sourceIdVal,
      reportedBy: req.user._id,
      villageName: waterSource.villageName || req.body.villageName || req.user.villageName || 'Unknown Village',
      issueType: issueTypeValLower,
      severity: severityVal,
      description: description.toString().trim()
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
