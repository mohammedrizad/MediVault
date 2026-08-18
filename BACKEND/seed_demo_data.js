// One-off seed script: populates demo doctors, nurses, scan centers, and
// patients (with realistic UHID + medical history) into MongoDB so the
// app's search/list/detail screens have real data to show.
// Usage: node seed_demo_data.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const AdminSchema = require("./Models/AdminSchema");
const DoctorScheme = require("./Models/DoctorScheme");
const NurseScheme = require("./Models/NurseScheme");
const ScanCenterSchema = require("./Models/ScanCenter");
const PatientSchemas = require("./Models/PatientsSchema");

const MONGO_URI = process.env.MONGO_URI;

async function main() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000, family: 4 });
  console.log("Connected to MongoDB");

  const admin = await AdminSchema.findOne({ email: "admin@test.com" });
  if (!admin) throw new Error("Default admin not found - start the backend once first.");

  // ---------------- Doctors ----------------
  const doctorDefs = [
    {
      Doctor_name: "Dr. Aisha Reddy",
      Gender: "Female",
      DOB: "1985-04-12",
      Email_Address: "aisha.reddy@medivault.demo",
      Current_Address: "12 MG Road, Coimbatore",
      Qualifications: "MBBS, MD (General Medicine)",
      Specialization: "General Medicine",
      Medical_License_Number: "MCI-DOC-1001",
      Medical_Council_Registration_Number: "TN-REG-4521",
      Years_of_experience: "12",
      Contract_type: "Full-time",
      PhoneNo: "9876500001",
    },
    {
      Doctor_name: "Dr. Karthik Suresh",
      Gender: "Male",
      DOB: "1980-09-23",
      Email_Address: "karthik.suresh@medivault.demo",
      Current_Address: "45 Race Course Road, Coimbatore",
      Qualifications: "MBBS, MS (Cardiology)",
      Specialization: "Cardiology",
      Medical_License_Number: "MCI-DOC-1002",
      Medical_Council_Registration_Number: "TN-REG-4522",
      Years_of_experience: "18",
      Contract_type: "Full-time",
      PhoneNo: "9876500002",
    },
    {
      Doctor_name: "Dr. Priya Nair",
      Gender: "Female",
      DOB: "1990-01-30",
      Email_Address: "priya.nair@medivault.demo",
      Current_Address: "8 Avinashi Road, Coimbatore",
      Qualifications: "MBBS, MD (Pediatrics)",
      Specialization: "Pediatrics",
      Medical_License_Number: "MCI-DOC-1003",
      Medical_Council_Registration_Number: "TN-REG-4523",
      Years_of_experience: "8",
      Contract_type: "Part-time",
      PhoneNo: "9876500003",
    },
    {
      Doctor_name: "Dr. Vignesh Kumar",
      Gender: "Male",
      DOB: "1978-06-15",
      Email_Address: "vignesh.kumar@medivault.demo",
      Current_Address: "22 DB Road, Coimbatore",
      Qualifications: "MBBS, MS (Orthopedics)",
      Specialization: "Orthopedics",
      Medical_License_Number: "MCI-DOC-1004",
      Medical_Council_Registration_Number: "TN-REG-4524",
      Years_of_experience: "20",
      Contract_type: "Full-time",
      PhoneNo: "9876500004",
    },
  ];

  const doctors = [];
  for (const d of doctorDefs) {
    let doc = await DoctorScheme.findOne({ Email_Address: d.Email_Address });
    if (!doc) {
      const Password = await bcrypt.hash(d.Medical_License_Number, 10);
      doc = await DoctorScheme.create({
        AdminID: admin._id,
        ...d,
        Password,
        Date_Joined: "01/01/2024",
        Day_Joined: "Monday",
        Time_Joined: "09:00:00",
      });
      console.log("Created doctor:", doc.Doctor_name, "login password:", d.Medical_License_Number);
    } else {
      console.log("Doctor already exists:", doc.Doctor_name);
    }
    doctors.push(doc);
  }

  // ---------------- Nurses ----------------
  const nurseDefs = [
    {
      Doctor_name: "Nurse Lakshmi Menon",
      Gender: "Female",
      DOB: "1992-03-11",
      Email_Address: "lakshmi.menon@medivault.demo",
      Current_Address: "5 Trichy Road, Coimbatore",
      Qualifications: "B.Sc Nursing",
      Specialization: "General Ward",
      Medical_License_Number: "MCI-NUR-2001",
      Medical_Council_Registration_Number: "TN-NREG-3301",
      Years_of_experience: "6",
    },
    {
      Doctor_name: "Nurse Ramesh Babu",
      Gender: "Male",
      DOB: "1988-11-05",
      Email_Address: "ramesh.babu@medivault.demo",
      Current_Address: "17 Sathy Road, Coimbatore",
      Qualifications: "B.Sc Nursing, ICU Certified",
      Specialization: "ICU",
      Medical_License_Number: "MCI-NUR-2002",
      Medical_Council_Registration_Number: "TN-NREG-3302",
      Years_of_experience: "10",
    },
    {
      Doctor_name: "Nurse Divya Shankar",
      Gender: "Female",
      DOB: "1995-07-19",
      Email_Address: "divya.shankar@medivault.demo",
      Current_Address: "3 Cross Cut Road, Coimbatore",
      Qualifications: "B.Sc Nursing",
      Specialization: "Pediatric Ward",
      Medical_License_Number: "MCI-NUR-2003",
      Medical_Council_Registration_Number: "TN-NREG-3303",
      Years_of_experience: "4",
    },
  ];

  const nurses = [];
  for (const n of nurseDefs) {
    let nurse = await NurseScheme.findOne({ Email_Address: n.Email_Address });
    if (!nurse) {
      const Password = await bcrypt.hash(n.Medical_License_Number, 10);
      nurse = await NurseScheme.create({
        AdminID: admin._id,
        ...n,
        Password,
        Date_Joined: "01/01/2024",
        Day_Joined: "Monday",
        Time_Joined: "09:00:00",
      });
      console.log("Created nurse:", nurse.Doctor_name, "login password:", n.Medical_License_Number);
    } else {
      console.log("Nurse already exists:", nurse.Doctor_name);
    }
    nurses.push(nurse);
  }

  // ---------------- Scan Centers ----------------
  const scanDefs = [
    {
      username: "CityScan Diagnostics",
      Gender: "N/A",
      DOB: "",
      Email_Address: "cityscan@medivault.demo",
      Current_Address: "88 Avinashi Road, Coimbatore",
      Qualifications: "NABL Accredited Imaging Center",
      Specialization: "MRI, CT, X-Ray",
      Medical_License_Number: "MCI-SCAN-3001",
      Medical_Council_Registration_Number: "TN-SREG-1101",
      Years_of_experience: "15",
    },
    {
      username: "Apex Radiology Center",
      Gender: "N/A",
      DOB: "",
      Email_Address: "apexradiology@medivault.demo",
      Current_Address: "14 Race Course Road, Coimbatore",
      Qualifications: "NABH Accredited Imaging Center",
      Specialization: "Ultrasound, CT, Mammography",
      Medical_License_Number: "MCI-SCAN-3002",
      Medical_Council_Registration_Number: "TN-SREG-1102",
      Years_of_experience: "9",
    },
  ];

  const scanCenters = [];
  for (const s of scanDefs) {
    let sc = await ScanCenterSchema.findOne({ Email_Address: s.Email_Address });
    if (!sc) {
      const Password = await bcrypt.hash(s.Medical_License_Number, 10);
      sc = await ScanCenterSchema.create({
        AdminID: admin._id,
        ...s,
        Password,
        Date_Joined: "01/01/2024",
        Day_Joined: "Monday",
        Time_Joined: "09:00:00",
      });
      console.log("Created scan center:", sc.username, "login password:", s.Medical_License_Number);
    } else {
      console.log("Scan center already exists:", sc.username);
    }
    scanCenters.push(sc);
  }

  // ---------------- Patients ----------------
  const patientDefs = [
    {
      Name: "Ravi Chandran",
      Aadhar: "234567890123",
      Address: "10 Gandhipuram, Coimbatore",
      DOB: "1990-05-14",
      Age: "36",
      Gender: "Male",
      Email: "ravi.chandran@example.com",
      Mobile_no: "9123456780",
      BloodGroup: "B+",
      EmergencyContactName: "Meena Chandran",
      EmergencyContactNumber: "9123456781",
      Allergies: "Penicillin",
      ChronicConditions: "Type 2 Diabetes",
      doctor: 0,
      History: [
        {
          disease: "Type 2 Diabetes - Routine Checkup",
          notes: "Blood sugar levels stable, continue current medication.",
          vitals: { BP: "128/82", Pulse: "76", Temp: "98.4 F", SpO2: "98%", Sugar: "142 mg/dL" },
          Date: "15/06/2026",
        },
        {
          disease: "Seasonal Flu",
          notes: "Prescribed rest and fluids, follow-up in 5 days if symptoms persist.",
          vitals: { BP: "122/80", Pulse: "88", Temp: "100.2 F", SpO2: "97%" },
          Date: "02/03/2026",
        },
      ],
    },
    {
      Name: "Sneha Iyer",
      Aadhar: "234567890124",
      Address: "22 RS Puram, Coimbatore",
      DOB: "1995-11-02",
      Age: "30",
      Gender: "Female",
      Email: "sneha.iyer@example.com",
      Mobile_no: "9123456782",
      BloodGroup: "O+",
      EmergencyContactName: "Anand Iyer",
      EmergencyContactNumber: "9123456783",
      Allergies: "None",
      ChronicConditions: "None",
      doctor: 2,
      History: [
        {
          disease: "Annual Pediatric-to-Adult Transition Checkup",
          notes: "All vitals normal, vaccination up to date.",
          vitals: { BP: "110/70", Pulse: "70", Temp: "98.6 F", SpO2: "99%" },
          Date: "20/07/2026",
        },
      ],
    },
    {
      Name: "Mohammed Farhan",
      Aadhar: "234567890125",
      Address: "5 Ukkadam, Coimbatore",
      DOB: "1978-02-27",
      Age: "48",
      Gender: "Male",
      Email: "mohammed.farhan@example.com",
      Mobile_no: "9123456784",
      BloodGroup: "A+",
      EmergencyContactName: "Fathima Farhan",
      EmergencyContactNumber: "9123456785",
      Allergies: "Sulfa drugs",
      ChronicConditions: "Hypertension, Coronary Artery Disease",
      doctor: 1,
      History: [
        {
          disease: "Hypertension Follow-up",
          notes: "BP well controlled on current dosage. Continue Amlodipine 5mg.",
          vitals: { BP: "134/86", Pulse: "80", Temp: "98.2 F", SpO2: "97%" },
          Date: "10/08/2026",
        },
        {
          disease: "Angina - Chest Pain Evaluation",
          notes: "ECG normal, stress test recommended. Advised low-sodium diet.",
          vitals: { BP: "142/90", Pulse: "92", Temp: "98.9 F", SpO2: "96%" },
          Date: "18/04/2026",
        },
      ],
    },
    {
      Name: "Lakshmi Priya",
      Aadhar: "234567890126",
      Address: "18 Peelamedu, Coimbatore",
      DOB: "2018-09-09",
      Age: "8",
      Gender: "Female",
      Email: "",
      Mobile_no: "9123456786",
      BloodGroup: "AB+",
      EmergencyContactName: "Suresh Kumar",
      EmergencyContactNumber: "9123456786",
      Allergies: "Peanuts",
      ChronicConditions: "Asthma",
      doctor: 2,
      History: [
        {
          disease: "Asthma - Routine Review",
          notes: "Inhaler technique reviewed with parent, symptoms well controlled.",
          vitals: { BP: "96/60", Pulse: "98", Temp: "98.1 F", SpO2: "98%" },
          Date: "25/07/2026",
        },
      ],
    },
    {
      Name: "Arjun Menon",
      Aadhar: "234567890127",
      Address: "30 Saibaba Colony, Coimbatore",
      DOB: "1965-12-19",
      Age: "60",
      Gender: "Male",
      Email: "arjun.menon@example.com",
      Mobile_no: "9123456788",
      BloodGroup: "B-",
      EmergencyContactName: "Radha Menon",
      EmergencyContactNumber: "9123456789",
      Allergies: "None",
      ChronicConditions: "Osteoarthritis (Knee)",
      doctor: 3,
      History: [
        {
          disease: "Knee Osteoarthritis - Post Physiotherapy Review",
          notes: "Improved mobility, continue physiotherapy twice weekly.",
          vitals: { BP: "130/84", Pulse: "74", Temp: "98.3 F", SpO2: "97%" },
          Date: "05/09/2026",
        },
      ],
    },
    {
      Name: "Divya Bhaskaran",
      Aadhar: "234567890128",
      Address: "9 Vadavalli, Coimbatore",
      DOB: "1988-04-03",
      Age: "38",
      Gender: "Female",
      Email: "divya.b@example.com",
      Mobile_no: "9123456790",
      BloodGroup: "O-",
      EmergencyContactName: "Bhaskaran R",
      EmergencyContactNumber: "9123456791",
      Allergies: "Latex",
      ChronicConditions: "Migraine",
      doctor: 0,
      History: [
        {
          disease: "Chronic Migraine Management",
          notes: "Frequency reduced from weekly to monthly with new medication.",
          vitals: { BP: "118/76", Pulse: "72", Temp: "98.5 F", SpO2: "99%" },
          Date: "12/05/2026",
        },
      ],
    },
    {
      Name: "Senthil Kumar",
      Aadhar: "234567890129",
      Address: "40 Singanallur, Coimbatore",
      DOB: "1973-08-21",
      Age: "53",
      Gender: "Male",
      Email: "senthil.kumar@example.com",
      Mobile_no: "9123456792",
      BloodGroup: "A-",
      EmergencyContactName: "Kavitha Senthil",
      EmergencyContactNumber: "9123456793",
      Allergies: "None",
      ChronicConditions: "Chronic Kidney Disease (Stage 2)",
      doctor: 1,
      History: [
        {
          disease: "CKD Stage 2 - Quarterly Review",
          notes: "Creatinine stable, continue low-protein diet and monitoring.",
          vitals: { BP: "138/88", Pulse: "78", Temp: "98.2 F", SpO2: "97%" },
          Date: "28/08/2026",
        },
      ],
    },
    {
      Name: "Keerthana Raj",
      Aadhar: "234567890130",
      Address: "27 Ganapathy, Coimbatore",
      DOB: "2001-01-17",
      Age: "25",
      Gender: "Female",
      Email: "keerthana.raj@example.com",
      Mobile_no: "9123456794",
      BloodGroup: "B+",
      EmergencyContactName: "Raj Kumar",
      EmergencyContactNumber: "9123456795",
      Allergies: "None",
      ChronicConditions: "None",
      doctor: 0,
      History: [
        {
          disease: "General Wellness Checkup",
          notes: "All parameters within normal range, advised routine follow-up in a year.",
          vitals: { BP: "112/74", Pulse: "68", Temp: "98.4 F", SpO2: "99%" },
          Date: "14/09/2026",
        },
      ],
    },
  ];

  // Determine starting UHID number
  const lastPatient = await PatientSchemas.findOne({ MedicalId: /^UHID-/ }, { MedicalId: 1 })
    .sort({ MedicalId: -1 })
    .lean();
  let nextNum = 1001;
  if (lastPatient && lastPatient.MedicalId) {
    const num = parseInt(lastPatient.MedicalId.replace("UHID-", ""), 10);
    if (!isNaN(num)) nextNum = num + 1;
  }

  for (const p of patientDefs) {
    const existing = await PatientSchemas.findOne({ Aadhar: p.Aadhar });
    if (existing) {
      console.log(`Patient already exists: ${existing.Name} (${existing.MedicalId})`);
      continue;
    }
    const assignedDoc = doctors[p.doctor];
    const medicalId = `UHID-${nextNum++}`;
    const patient = await PatientSchemas.create({
      Name: p.Name,
      MedicalId: medicalId,
      Aadhar: p.Aadhar,
      Address: p.Address,
      DOB: p.DOB,
      Age: p.Age,
      Gender: p.Gender,
      Email: p.Email || undefined,
      Mobile_no: p.Mobile_no,
      Photo: "",
      BloodGroup: p.BloodGroup,
      EmergencyContactName: p.EmergencyContactName,
      EmergencyContactNumber: p.EmergencyContactNumber,
      Allergies: p.Allergies,
      ChronicConditions: p.ChronicConditions,
      status: "Active",
      assignedDoctor: assignedDoc ? assignedDoc.Doctor_name : "Unassigned",
      doctorId: assignedDoc ? String(assignedDoc._id) : "",
      History: p.History.map((h) => ({
        disease: h.disease,
        notes: h.notes,
        vitals: h.vitals,
        Date: h.Date,
        DoctorDetails: assignedDoc
          ? { name: assignedDoc.Doctor_name, specialization: assignedDoc.Specialization }
          : {},
        report: {},
        preciption: [],
      })),
    });
    console.log(`Created patient: ${patient.Name} -> ${patient.MedicalId}`);
  }

  console.log("\nSeed complete.");
  console.log("Demo login credentials (password = Medical License Number shown above):");
  console.log("  Doctors:", doctorDefs.map((d) => d.Email_Address).join(", "));
  console.log("  Nurses:", nurseDefs.map((n) => n.Email_Address).join(", "));
  console.log("  Scan Centers:", scanDefs.map((s) => s.Email_Address).join(", "));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
