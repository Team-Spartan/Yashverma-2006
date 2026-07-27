const mongoose = require('mongoose');

const waterTestLogSchema = new mongoose.Schema({
  waterSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WaterSource',
    required: true
  },
  testedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  villageName: {
    type: String,
    required: true
  },
  parameters: {
    ph: {
      type: Number,
      required: [true, 'Please provide pH value (e.g. 7.2)']
    },
    turbidity: {
      type: Number, // NTU
      required: [true, 'Please provide Turbidity in NTU']
    },
    tds: {
      type: Number, // mg/L
      required: [true, 'Please provide Total Dissolved Solids (TDS)']
    },
    nitrates: {
      type: Number, // mg/L
      default: 0
    },
    fluoride: {
      type: Number, // mg/L
      default: 0
    },
    dissolvedOxygen: {
      type: Number, // mg/L
      default: 0
    },
    eColiPresent: {
      type: Boolean,
      default: false
    }
  },
  calculatedWQI: {
    type: Number,
    required: true
  },
  qualityStatus: {
    type: String,
    enum: ['Excellent', 'Good', 'Poor', 'Unsafe', 'Critical'],
    required: true
  },
  remarks: {
    type: String,
    default: ''
  },
  testDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('WaterTestLog', waterTestLogSchema);
