const mongoose = require('mongoose');

const waterSourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter water source name (e.g. Village Handpump 04, North Tank)'],
    trim: true
  },
  sourceType: {
    type: String,
    enum: ['borewell', 'handpump', 'piped_supply', 'well', 'pond_river', 'overhead_tank'],
    required: true
  },
  villageName: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  locationCoordinates: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'contaminated', 'decommissioned'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('WaterSource', waterSourceSchema);
