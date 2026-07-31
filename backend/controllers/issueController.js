const { IssueReport } = require('../models');

exports.createIssue = async (req, res) => {
  try {
    const { village, title, description, category, severity, location } = req.body;

    const issue = await IssueReport.create({
      userId: req.user._id,
      village,
      title,
      description,
      category,
      severity,
      location,
    });

    const populated = await issue.populate('userId', 'name village');
    res.status(201).json({ issue: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getIssues = async (req, res) => {
  try {
    const { village, status, severity, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (village) filter.village = village;
    else if (req.user.role !== 'admin') filter.village = req.user.village;

    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const total = await IssueReport.countDocuments(filter);
    const issues = await IssueReport.find(filter)
      .populate('userId', 'name village')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      issues,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getIssueById = async (req, res) => {
  try {
    const issue = await IssueReport.findById(req.params.id)
      .populate('userId', 'name village')
      .populate('assignedTo', 'name');
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json({ issue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateIssue = async (req, res) => {
  try {
    const issue = await IssueReport.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const allowedFields = [
      'title', 'description', 'category', 'severity', 'status',
      'location', 'assignedTo', 'adminNotes',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        issue[field] = req.body[field];
      }
    });

    if (req.body.status === 'resolved' && !issue.resolvedDate) {
      issue.resolvedDate = new Date();
    }

    await issue.save();
    const populated = await issue.populate('userId', 'name village');
    res.json({ issue: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    const issue = await IssueReport.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    await IssueReport.findByIdAndDelete(req.params.id);
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
