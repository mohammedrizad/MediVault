const mongoose = require("mongoose");

const AIAnalysisSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PatientsSchemas",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "X-RAY",
      "CT-SCAN",
      "MRI",
      "LAB_REPORT",
      "DRUG_INTERACTION",
      "HEALTH_INSIGHTS",
    ],
    required: true,
  },
  imageUrl: {
    type: String,
  },
  inputData: {
    type: Object, // Store text or other input if not image
  },
  analysisResult: {
    type: Object, // The JSON output from Gemini
    required: true,
  },
  confidence: {
    type: Number,
  },
  severity: {
    type: String,
    enum: ["Normal", "Mild", "Moderate", "Severe", "Critical", "Unknown"],
    default: "Unknown",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AIAnalysis", AIAnalysisSchema);
