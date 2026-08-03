const mongoose = require("mongoose");

const AccessRequestSchema = new mongoose.Schema({
  requestingHospital: {
    type: String,
    required: true,
  },
  requestingHospitalId: {
    type: String,
  },
  requestingDoctor: {
    type: String,
    required: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  patientHospital: {
    type: String,
    required: true,
    default: "MediVault Hospital",
  },
  patientHospitalId: {
    type: String,
  },
  reason: {
    type: String,
    required: true,
  },
  urgency: {
    type: String,
    enum: ["Normal", "Urgent", "Emergency"],
    default: "Normal",
  },
  dataCategories: {
    type: [String],
    default: ["Basic Info", "Medical History"],
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Revoked", "Expired"],
    default: "Pending",
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  approvalDate: {
    type: Date,
  },
  approvedBy: {
    type: String,
  },
  rejectionReason: {
    type: String,
  },
  expiresAt: {
    type: Date,
  },
  accessCount: {
    type: Number,
    default: 0,
  },
  lastAccessedAt: {
    type: Date,
  },
  revokedAt: {
    type: Date,
  },
  revokedBy: {
    type: String,
  },
  revokeReason: {
    type: String,
  },
});

module.exports = mongoose.model("AccessRequest", AccessRequestSchema);
