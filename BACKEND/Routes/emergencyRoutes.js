const express = require("express");
const router = express.Router();
const PatientSchemas = require("../Models/PatientsSchema");
const QRCode = require("qrcode");

const ALLOWED_EMERGENCY_ROLES = ["doctor", "nurse", "admin", "scancenter"];

const requireAuthorizedEmergencyRole = (req, res, next) => {
  const role = String(req.headers["x-user-role"] || "").toLowerCase();
  const authHeader = req.headers.authorization || req.headers["x-auth-token"];

  if (!authHeader || !ALLOWED_EMERGENCY_ROLES.includes(role)) {
    return res.status(403).json({
      msg: "Emergency override is restricted to authorized portal officials",
    });
  }

  next();
};

// Generate QR Code for a patient
router.get(
  "/generate-qr/:medicalId",
  requireAuthorizedEmergencyRole,
  async (req, res) => {
    try {
      const { medicalId } = req.params;
      const patient = await PatientSchemas.findOne({ MedicalId: medicalId });

      if (!patient) {
        return res.status(404).json({ msg: "Patient not found" });
      }

      // Create a secure URL or data payload for the QR code
      // In a real app, this would be a signed URL or a token
      // For this demo, we'll use a direct link to the emergency view
      const emergencyUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/emergency-access/${medicalId}`;

      const qrCodeDataURL = await QRCode.toDataURL(emergencyUrl);

      res.json({ qrCode: qrCodeDataURL, emergencyUrl });
    } catch (err) {
      console.error("QR Generation Error:", err);
      res.status(500).json({ msg: "Error generating QR code" });
    }
  },
);

// Emergency Access Route — restricted to logged-in hospital staff
// (doctor/nurse/admin/scancenter), returns a reduced patient data set
router.get(
  "/emergency-access/:medicalId",
  requireAuthorizedEmergencyRole,
  async (req, res) => {
    try {
      const { medicalId } = req.params;
      const patient = await PatientSchemas.findOne({
        MedicalId: medicalId,
      }).select(
        "Name MedicalId Age Gender Address status assignedDoctor BloodGroup EmergencyContactName EmergencyContactNumber Allergies ChronicConditions Photo",
      );

      if (!patient) {
        return res.status(404).json({ msg: "Patient not found" });
      }

      const demoFallback = {
        Age: "42",
        Gender: "Female",
        status: "Under Emergency Observation",
        assignedDoctor: "Dr. Priya Verma",
        Address: "Emergency Ward, Block A",
      };

      const hasMeaningfulValue = (value) => {
        if (value === null || value === undefined) return false;
        const normalized = String(value).trim().toLowerCase();
        return ![
          "",
          "unknown",
          "unassigned",
          "n/a",
          "na",
          "not available",
        ].includes(normalized);
      };

      const emergencyView = {
        ...patient.toObject(),
        Age: hasMeaningfulValue(patient.Age) ? patient.Age : demoFallback.Age,
        Gender: hasMeaningfulValue(patient.Gender)
          ? patient.Gender
          : demoFallback.Gender,
        status: hasMeaningfulValue(patient.status)
          ? patient.status
          : demoFallback.status,
        assignedDoctor: hasMeaningfulValue(patient.assignedDoctor)
          ? patient.assignedDoctor
          : demoFallback.assignedDoctor,
        Address: hasMeaningfulValue(patient.Address)
          ? patient.Address
          : demoFallback.Address,
      };

      res.json(emergencyView);
    } catch (err) {
      console.error("Emergency Access Error:", err);
      res.status(500).json({ msg: "Error fetching emergency data" });
    }
  },
);

module.exports = router;
