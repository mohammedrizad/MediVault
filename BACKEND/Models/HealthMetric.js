const mongoose = require("mongoose");

const HealthMetricSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PatientsSchemas",
    required: true,
  },
  metricType: {
    type: String,
    required: true, // e.g., "Heart Rate", "Blood Pressure", "Glucose"
  },
  value: {
    type: Number,
    required: true,
  },
  unit: {
    type: String, // e.g., "bpm", "mmHg", "mg/dL"
  },
  status: {
    type: String,
    enum: ["Normal", "Warning", "Critical"],
    default: "Normal",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("HealthMetric", HealthMetricSchema);
