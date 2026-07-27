const mongoose = require('mongoose');

const issueReportSchema = new mongoose.Schema({
  waterSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WaterSource',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  villageName: {
    type: String,
    required: true
  },
  issueType: {
    type: String,
    enum: ['bad_odor', 'discoloration', 'pipe_leakage', 'contamination_outbreak', 'low_pressure', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  description: {
    type: String,
    required: [true, 'Please describe the issue in detail']
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved'],
    default: 'open'
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('IssueReport', issueReportSchema);
