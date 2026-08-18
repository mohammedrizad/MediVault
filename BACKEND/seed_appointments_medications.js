const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const Appointment = require("./Models/Appointment");
const Medication = require("./Models/Medication");
const PatientSchemas = require("./Models/PatientsSchema");
const DoctorScheme = require("./Models/DoctorScheme");
const NurseScheme = require("./Models/NurseScheme");
const ScanCenterSchema = require("./Models/ScanCenter");
const AdminSchema = require("./Models/AdminSchema");

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  });
  console.log("Connected to MongoDB");

  const admin = await AdminSchema.findOne({ email: "admin@test.com" });
  const patients = await PatientSchemas.find().limit(8);
  const doctors = await DoctorScheme.find().limit(4);
  const nurses = await NurseScheme.find().limit(3);
  const scanCenters = await ScanCenterSchema.find().limit(2);

  if (!patients.length || !doctors.length) {
    console.log("Run seed_demo_data.js first - no patients/doctors found.");
    process.exit(1);
  }

  const existingAppt = await Appointment.countDocuments();
  if (existingAppt > 0) {
    console.log(`Appointments already seeded (${existingAppt} found). Skipping.`);
  } else {
    const today = new Date();
    const fmt = (d) => d.toISOString().split("T")[0];
    const addDays = (n) => {
      const d = new Date(today);
      d.setDate(d.getDate() + n);
      return d;
    };

    const types = ["Consultation", "Follow-up", "Check-up", "Treatment"];
    const statuses = ["Scheduled", "Confirmed", "Pending", "Completed"];
    const times = ["09:00 AM", "10:30 AM", "11:15 AM", "02:00 PM", "03:30 PM"];
    const rooms = ["Room 101", "Room 102", "Room 103", "Consultation Bay 2"];

    const appointments = [];
    patients.forEach((p, i) => {
      const doctor = doctors[i % doctors.length];
      const nurse = nurses[i % nurses.length];
      appointments.push({
        AdminID: admin._id,
        patientId: p.MedicalId,
        patientName: p.Name,
        patientEmail: p.Email,
        patientPhone: p.Mobile_no,
        doctorId: doctor._id.toString(),
        doctorName: doctor.Doctor_name,
        nurseId: nurse ? nurse._id.toString() : undefined,
        nurseName: nurse ? nurse.Doctor_name : undefined,
        date: fmt(addDays(i - 2)),
        time: times[i % times.length],
        duration: "30 mins",
        type: types[i % types.length],
        status: statuses[i % statuses.length],
        reason: `${p.ChronicConditions !== "None" ? p.ChronicConditions : "General"} review`,
        notes: `Routine follow-up for ${p.Name}`,
        location: rooms[i % rooms.length],
        condition: p.ChronicConditions,
        createdByRole: "doctor",
        createdById: doctor._id.toString(),
      });
    });

    // Scan center appointments
    if (scanCenters.length) {
      const scanTypes = ["MRI Brain", "CT Chest", "X-Ray Chest", "Ultrasound Abdomen"];
      patients.slice(0, 4).forEach((p, i) => {
        const sc = scanCenters[i % scanCenters.length];
        appointments.push({
          AdminID: admin._id,
          patientId: p.MedicalId,
          patientName: p.Name,
          patientPhone: p.Mobile_no,
          scanCenterId: sc._id.toString(),
          scanCenterName: sc.username,
          scanType: scanTypes[i % scanTypes.length],
          date: fmt(addDays(i + 1)),
          time: times[i % times.length],
          type: "Scan",
          status: i % 2 === 0 ? "Scheduled" : "Completed",
          reason: `${scanTypes[i % scanTypes.length]} for ${p.ChronicConditions !== "None" ? p.ChronicConditions : "diagnostic evaluation"}`,
          createdByRole: "scancenter",
          createdById: sc._id.toString(),
        });
      });
    }

    await Appointment.insertMany(appointments);
    console.log(`Seeded ${appointments.length} appointments`);
  }

  const existingMeds = await Medication.countDocuments();
  if (existingMeds > 0) {
    console.log(`Medications already seeded (${existingMeds} found). Skipping.`);
  } else {
    const medDefs = [
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
      { name: "Amlodipine", dosage: "5mg", frequency: "Once daily" },
      { name: "Atorvastatin", dosage: "10mg", frequency: "Once daily at night" },
      { name: "Salbutamol Inhaler", dosage: "100mcg", frequency: "As needed" },
      { name: "Paracetamol", dosage: "500mg", frequency: "Every 6 hours as needed" },
    ];
    const today = new Date();
    const fmt = (d) => d.toISOString().split("T")[0];

    const medications = patients.map((p, i) => {
      const doctor = doctors[i % doctors.length];
      const med = medDefs[i % medDefs.length];
      return {
        AdminID: admin._id,
        patientId: p.MedicalId,
        patientName: p.Name,
        medicineName: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        route: med.name.includes("Inhaler") ? "Inhalation" : "Oral",
        prescribedBy: doctor.Doctor_name,
        prescribedById: doctor._id.toString(),
        startDate: fmt(today),
        status: "Active",
        notes: `Prescribed for ${p.ChronicConditions !== "None" ? p.ChronicConditions : "general management"}`,
      };
    });

    await Medication.insertMany(medications);
    console.log(`Seeded ${medications.length} medications`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
