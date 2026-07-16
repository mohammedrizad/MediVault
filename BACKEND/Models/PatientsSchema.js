const mongoose = require("mongoose");

const PatientScheme = new mongoose.Schema({
  Name: String,
  MedicalId: { type: String, unique: true }, // Simple MED001, MED002 format
  Aadhar: String,
  Address: String,
  DOB: String,
  Age: String,
  Gender: String,
  Email: { type: String, sparse: true, unique: true },
  Mobile_no: { type: String, sparse: true, unique: true },
  Photo: String,
  // Emergency Fields
  BloodGroup: { type: String, default: "Unknown" },
  EmergencyContactName: { type: String, default: "" },
  EmergencyContactNumber: { type: String, default: "" },
  Allergies: { type: String, default: "None" },
  ChronicConditions: { type: String, default: "None" },
  status: { type: String, default: "Active" },
  assignedDoctor: { type: String, default: "Unassigned" },
  doctorId: { type: String, default: "" },
  History: [
    {
      disease: String,
      notes: String,
      vitals: { type: Object, default: {} },
      Date: String,
      DoctorDetails: { type: Object, default: {} },
      report: {
        type: Object,
        default: {},
        files: [
          {
            name: String,
            url: String,
            uploadDate: String,
            fileHash: String, // SHA-256 hash for integrity verification
            encryptionIV: String, // AES-256-CBC initialization vector
            encrypted: { type: Boolean, default: false },
          },
        ],
      },
      preciption: [],
    },
  ],
});

module.exports = mongoose.model("PatientsSchemas", PatientScheme);
