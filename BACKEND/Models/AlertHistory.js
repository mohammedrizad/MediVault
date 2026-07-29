const mongoose = require("mongoose");

const AlertHistorySchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
  },
  recipientContact: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  alertType: {
    type: String,
    enum: [
      "EMAIL",
      "SMS",
      "LAB_RESULT",
      "DRUG_INTERACTION",
      "HEALTH_TREND",
      "FOLLOW_UP",
      "SYSTEM",
    ],
    required: true,
  },
  severity: {
    type: String,
    enum: ["Critical", "High", "Medium", "Low"],
    default: "Medium",
  },
  status: {
    type: String,
    enum: ["SENT", "FAILED", "PENDING", "ACKNOWLEDGED"],
    default: "SENT",
  },
  acknowledged: {
    type: Boolean,
    default: false,
  },
  acknowledgedBy: {
    type: String,
    default: null,
  },
  acknowledgedAt: {
    type: Date,
    default: null,
  },
  value: {
    type: String,
    default: null,
  },
  error: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

AlertHistorySchema.index({ timestamp: -1 });
AlertHistorySchema.index({ patientName: 1 });
AlertHistorySchema.index({ severity: 1 });
AlertHistorySchema.index({ acknowledged: 1 });

module.exports = mongoose.model("AlertHistory", AlertHistorySchema);
