const mongoose = require("mongoose");

const MedicationSchema = new mongoose.Schema(
  {
    AdminID: { type: mongoose.Schema.Types.ObjectId },
    patientId: { type: String, required: true }, // MedicalId (UHID)
    patientName: String,
    medicineName: { type: String, required: true },
    dosage: String,
    frequency: String,
    route: { type: String, default: "Oral" },
    prescribedBy: String,
    prescribedById: String,
    startDate: String,
    endDate: String,
    status: { type: String, default: "Active" }, // Active, Completed, Discontinued
    notes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Medication", MedicationSchema);
