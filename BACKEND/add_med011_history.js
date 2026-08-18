// Script to add medical history with blood tests for MED011
const mongoose = require("mongoose");
require("dotenv").config();

async function addMED011History() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const historyEntries = [
      {
        disease: "Dengue Fever",
        notes:
          "Presented with high fever (103°F) for 4 days, severe body aches, headache, and rash. Platelet count dropped to 85,000. Admitted for observation and IV fluids. NS1 Antigen positive. Discharged after 5 days with improved platelet count.",
        Date: "2025-10-20",
        DoctorDetails:
          "Dr. Suresh Menon - General Medicine, MediVault Centre Hospital",
        vitals: {
          bp: "110/70",
          pulse: "102",
          temp: "103.2",
          weight: "65kg",
          spo2: "96%",
        },
        preciption: [
          {
            medicine: "Paracetamol",
            dosage: "650mg",
            duration: "Every 6 hours for 5 days",
          },
          {
            medicine: "ORS Solution",
            dosage: "1 sachet",
            duration: "3 times daily for 7 days",
          },
          {
            medicine: "Pantoprazole",
            dosage: "40mg",
            duration: "Once daily for 5 days",
          },
        ],
        bloodTests: [
          {
            testName: "Platelet Count",
            value: "85000",
            unit: "/mcL",
            normalRange: "150000-400000",
            status: "LOW",
          },
          {
            testName: "WBC Count",
            value: "3200",
            unit: "/mcL",
            normalRange: "4500-11000",
            status: "LOW",
          },
          {
            testName: "Hemoglobin",
            value: "14.5",
            unit: "g/dL",
            normalRange: "13.5-17.5",
            status: "NORMAL",
          },
          {
            testName: "Hematocrit",
            value: "46",
            unit: "%",
            normalRange: "38-50",
            status: "NORMAL",
          },
          {
            testName: "NS1 Antigen",
            value: "Positive",
            unit: "",
            normalRange: "Negative",
            status: "HIGH",
          },
          {
            testName: "SGPT (ALT)",
            value: "120",
            unit: "U/L",
            normalRange: "7-56",
            status: "HIGH",
          },
          {
            testName: "SGOT (AST)",
            value: "98",
            unit: "U/L",
            normalRange: "10-40",
            status: "HIGH",
          },
        ],
      },
      {
        disease: "Annual Health Checkup",
        notes:
          "Routine annual checkup. All vitals within normal limits. CBC, Lipid profile, LFT, KFT, Thyroid - all normal. Vitamin D slightly low at 22 ng/mL. Advised supplementation and regular exercise.",
        Date: "2025-07-10",
        DoctorDetails:
          "Dr. Anand Kumar - Internal Medicine, MediVault Centre Hospital",
        vitals: {
          bp: "120/78",
          pulse: "74",
          temp: "98.4",
          weight: "66kg",
          spo2: "99%",
        },
        preciption: [
          {
            medicine: "Vitamin D3",
            dosage: "60000 IU",
            duration: "Once weekly for 8 weeks",
          },
          {
            medicine: "Calcium + Vitamin D",
            dosage: "500mg",
            duration: "Once daily for 3 months",
          },
        ],
        bloodTests: [
          {
            testName: "Hemoglobin",
            value: "15.2",
            unit: "g/dL",
            normalRange: "13.5-17.5",
            status: "NORMAL",
          },
          {
            testName: "WBC Count",
            value: "7800",
            unit: "/mcL",
            normalRange: "4500-11000",
            status: "NORMAL",
          },
          {
            testName: "Platelet Count",
            value: "280000",
            unit: "/mcL",
            normalRange: "150000-400000",
            status: "NORMAL",
          },
          {
            testName: "Fasting Blood Sugar",
            value: "88",
            unit: "mg/dL",
            normalRange: "70-100",
            status: "NORMAL",
          },
          {
            testName: "Total Cholesterol",
            value: "175",
            unit: "mg/dL",
            normalRange: "< 200",
            status: "NORMAL",
          },
          {
            testName: "LDL Cholesterol",
            value: "102",
            unit: "mg/dL",
            normalRange: "< 130",
            status: "NORMAL",
          },
          {
            testName: "HDL Cholesterol",
            value: "52",
            unit: "mg/dL",
            normalRange: "> 40",
            status: "NORMAL",
          },
          {
            testName: "Triglycerides",
            value: "105",
            unit: "mg/dL",
            normalRange: "< 150",
            status: "NORMAL",
          },
          {
            testName: "SGPT (ALT)",
            value: "22",
            unit: "U/L",
            normalRange: "7-56",
            status: "NORMAL",
          },
          {
            testName: "Serum Creatinine",
            value: "0.9",
            unit: "mg/dL",
            normalRange: "0.7-1.3",
            status: "NORMAL",
          },
          {
            testName: "TSH",
            value: "2.8",
            unit: "mIU/L",
            normalRange: "0.4-4.0",
            status: "NORMAL",
          },
          {
            testName: "Vitamin D (25-OH)",
            value: "22",
            unit: "ng/mL",
            normalRange: "30-100",
            status: "LOW",
          },
        ],
      },
      {
        disease: "Acute Gastroenteritis",
        notes:
          "Severe vomiting and watery diarrhea for 2 days. Dehydration grade 2. IV fluids started. Stool routine: bacterial infection. Treated with antibiotics and probiotics. Resolved in 3 days.",
        Date: "2025-03-18",
        DoctorDetails:
          "Dr. Suresh Menon - General Medicine, MediVault Centre Hospital",
        vitals: {
          bp: "100/65",
          pulse: "108",
          temp: "100.8",
          weight: "64kg",
          spo2: "97%",
        },
        preciption: [
          {
            medicine: "Ciprofloxacin",
            dosage: "500mg",
            duration: "Twice daily for 5 days",
          },
          {
            medicine: "Ondansetron",
            dosage: "4mg",
            duration: "As needed for nausea",
          },
          {
            medicine: "Saccharomyces Boulardii (Probiotic)",
            dosage: "250mg",
            duration: "Twice daily for 7 days",
          },
          {
            medicine: "ORS Solution",
            dosage: "1 sachet",
            duration: "After every loose stool",
          },
        ],
        bloodTests: [
          {
            testName: "WBC Count",
            value: "13500",
            unit: "/mcL",
            normalRange: "4500-11000",
            status: "HIGH",
          },
          {
            testName: "CRP (C-Reactive Protein)",
            value: "15.2",
            unit: "mg/L",
            normalRange: "< 3.0",
            status: "HIGH",
          },
          {
            testName: "Serum Sodium",
            value: "132",
            unit: "mEq/L",
            normalRange: "136-145",
            status: "LOW",
          },
          {
            testName: "Serum Potassium",
            value: "3.2",
            unit: "mEq/L",
            normalRange: "3.5-5.0",
            status: "LOW",
          },
          {
            testName: "Blood Urea",
            value: "42",
            unit: "mg/dL",
            normalRange: "15-40",
            status: "HIGH",
          },
          {
            testName: "Serum Creatinine",
            value: "1.4",
            unit: "mg/dL",
            normalRange: "0.7-1.3",
            status: "HIGH",
          },
        ],
      },
    ];

    const result = await mongoose.connection.db
      .collection("patientsschemas")
      .updateOne(
        { MedicalId: "MED011" },
        { $set: { History: historyEntries } },
      );

    if (result.modifiedCount === 1) {
      console.log(
        "✅ Successfully added 3 medical history entries with blood tests for MED011!",
      );
      console.log("   - Dengue Fever (Oct 2025) — 7 blood tests");
      console.log("   - Annual Health Checkup (Jul 2025) — 12 blood tests");
      console.log("   - Acute Gastroenteritis (Mar 2025) — 6 blood tests");
    } else {
      console.log("❌ MED011 not found or not updated.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

addMED011History();
