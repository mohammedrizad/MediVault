const mongoose = require("mongoose");

const VitalBreakdownSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    score: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Normal", "Borderline", "Concerning", "Critical"],
      required: true,
    },
  },
  { _id: false },
);

const EarlyWarningScoreSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  doctorId: {
    type: String,
    default: "",
  },
  doctorName: {
    type: String,
    default: "",
  },
  vitals: {
    heartRate: { type: Number, required: true },
    systolicBP: { type: Number, required: true },
    diastolicBP: { type: Number, required: true },
    temperature: { type: Number, required: true },
    respiratoryRate: { type: Number, required: true },
    oxygenSaturation: { type: Number, required: true },
  },
  breakdown: [VitalBreakdownSchema],
  totalScore: {
    type: Number,
    required: true,
  },
  riskLevel: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    required: true,
  },
  recommendation: {
    type: String,
    required: true,
  },
  alertGenerated: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for patient history queries
EarlyWarningScoreSchema.index({ patientId: 1, timestamp: -1 });

module.exports = mongoose.model("EarlyWarningScore", EarlyWarningScoreSchema);
