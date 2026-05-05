const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName: { type: String, required: true },
  cropNameHindi: String,
  variety: String,
  sowingDate: Date,
  expectedHarvestDate: Date,
  area: Number,
  areaUnit: { type: String, default: 'acres' },
  status: { type: String, enum: ['planned', 'sowing', 'growing', 'harvesting', 'harvested'], default: 'planned' },
  soilHealth: {
    ph: Number,
    nitrogen: String,
    phosphorus: String,
    potassium: String,
    organicMatter: String
  },
  irrigationSchedule: [{
    date: Date,
    amount: Number,
    method: String,
    completed: Boolean
  }],
  pestDisease: [{
    detectedOn: Date,
    type: String,
    severity: String,
    treatment: String,
    aiDiagnosis: String
  }],
  fertilizers: [{
    name: String,
    quantity: Number,
    unit: String,
    appliedOn: Date,
    nextDue: Date
  }],
  weatherAlerts: [String],
  aiRecommendations: [String],
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Crop', cropSchema);