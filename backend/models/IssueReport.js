const mongoose = require('mongoose');

const issueReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    village: {
      type: String,
      required: [true, 'Village name is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: [
        'contamination',
        'infrastructure',
        'supply_shortage',
        'flooding',
        'other',
      ],
      required: [true, 'Category is required'],
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['reported', 'acknowledged', 'in_progress', 'resolved', 'closed'],
      default: 'reported',
    },
    location: {
      type: String,
      trim: true,
    },
    reportedDate: {
      type: Date,
      default: Date.now,
    },
    resolvedDate: {
      type: Date,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

issueReportSchema.index({ village: 1, status: 1 });
issueReportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('IssueReport', issueReportSchema);
