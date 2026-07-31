const mongoose = require('mongoose');

const waterTestSchema = new mongoose.Schema(
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
    sourceName: {
      type: String,
      required: [true, 'Water source name is required'],
      trim: true,
    },
    sourceType: {
      type: String,
      enum: ['well', 'handpump', 'tap', 'river', 'pond', 'other'],
      required: [true, 'Source type is required'],
    },
    testDate: {
      type: Date,
      required: [true, 'Test date is required'],
      default: Date.now,
    },
    ph: {
      type: Number,
      min: 0,
      max: 14,
    },
    turbidity: {
      type: Number,
      min: 0,
    },
    turbidityUnit: {
      type: String,
      default: 'NTU',
    },
    tds: {
      type: Number,
      min: 0,
    },
    tdsUnit: {
      type: String,
      default: 'ppm',
    },
    chlorine: {
      type: Number,
      min: 0,
    },
    chlorineUnit: {
      type: String,
      default: 'mg/L',
    },
    temperature: {
      type: Number,
    },
    bacteriaTest: {
      type: String,
      enum: ['safe', 'unsafe', 'not_tested'],
      default: 'not_tested',
    },
    overallStatus: {
      type: String,
      enum: ['safe', 'caution', 'unsafe'],
      required: [true, 'Overall status is required'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

waterTestSchema.index({ village: 1, testDate: -1 });
waterTestSchema.index({ userId: 1, testDate: -1 });

module.exports = mongoose.model('WaterTest', waterTestSchema);
