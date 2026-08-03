const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  user: { type: String, required: true },
  role: {
    type: String,
    enum: [
      "admin",
      "doctor",
      "nurse",
      "patient",
      "scan_center",
      "system",
      "unknown",
    ],
    default: "unknown",
  },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  ip: { type: String, default: "0.0.0.0" },
  severity: {
    type: String,
    enum: ["high", "medium", "low", "info"],
    default: "info",
  },
  status: { type: String, enum: ["success", "failed"], default: "success" },
  details: { type: String, default: "" },
  method: { type: String },
  path: { type: String },
});

// Auto-expire logs after 90 days
AuditLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);
