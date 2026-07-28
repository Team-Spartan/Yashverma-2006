const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['EDIT', 'DELETE'],
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    default: 'WaterTestLog',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  villageName: {
    type: String,
    required: true
  },
  waterSourceName: {
    type: String,
    required: true
  },
  changes: {
    before: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    after: {
      type: mongoose.Schema.Types.Mixed // Optional for delete
    }
  },
  description: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
