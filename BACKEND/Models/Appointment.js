const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    AdminID: { type: mongoose.Schema.Types.ObjectId },
    patientId: { type: String, required: true }, // MedicalId (UHID)
    patientName: String,
    patientEmail: String,
    patientPhone: String,
    doctorId: String,
    doctorName: String,
    nurseId: String,
    nurseName: String,
    scanCenterId: String,
    scanCenterName: String,
    scanType: String,
    date: { type: String, required: true }, // YYYY-MM-DD
    time: String,
    duration: { type: String, default: "30 mins" },
    type: {
      type: String,
      default: "Consultation",
    }, // Consultation, Follow-up, Check-up, Emergency, Treatment, Scan
    status: {
      type: String,
      default: "Scheduled",
    }, // Scheduled, Confirmed, Pending, In Progress, Completed, Cancelled, Urgent
    reason: String,
    notes: String,
    location: String,
    condition: String,
    createdByRole: String,
    createdById: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
