// Script to generate synthetic patient medical records CSV
// Run: node generate_patient_csv.js

const fs = require("fs");
const path = require("path");

// ─── Helper functions ───
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min, max, dec = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dec));
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}
function chance(pct) {
  return Math.random() * 100 < pct;
}
function padId(n) {
  return String(n).padStart(5, "0");
}
function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}
function fmtDateTime(d) {
  return d.toISOString().slice(0, 19).replace("T", " ");
}
function randomDate(startDaysAgo, endDaysAgo = 0) {
  const now = new Date(2026, 2, 5); // March 5, 2026
  const start = new Date(now);
  start.setDate(start.getDate() - startDaysAgo);
  const end = new Date(now);
  end.setDate(end.getDate() - endDaysAgo);
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

// ─── Data pools ───
const maleFirst = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Vihaan",
  "Arjun",
  "Sai",
  "Reyansh",
  "Ayaan",
  "Krishna",
  "Ishaan",
  "Shaurya",
  "Atharv",
  "Advait",
  "Dhruv",
  "Kabir",
  "Ritvik",
  "Aarush",
  "Kian",
  "Darsh",
  "Rishi",
  "Rajesh",
  "Suresh",
  "Mahesh",
  "Ramesh",
  "Ganesh",
  "Vikram",
  "Amit",
  "Rohit",
  "Sanjay",
  "Deepak",
  "Mohan",
  "Gopal",
  "Harish",
  "Naveen",
  "Prasad",
  "Karthik",
  "Venkat",
  "Ravi",
  "Arun",
  "Manoj",
  "Mohammed",
  "Ahmed",
  "Farhan",
  "Imran",
  "Rizwan",
  "Zaid",
  "Omar",
  "Ibrahim",
  "Yusuf",
  "Hassan",
];
const femaleFirst = [
  "Aanya",
  "Aadhya",
  "Myra",
  "Ananya",
  "Anika",
  "Diya",
  "Saanvi",
  "Aarohi",
  "Vivaan",
  "Ishita",
  "Priya",
  "Neha",
  "Divya",
  "Kavya",
  "Meera",
  "Anjali",
  "Pooja",
  "Shreya",
  "Nisha",
  "Riya",
  "Lakshmi",
  "Gayatri",
  "Bhavana",
  "Swathi",
  "Sneha",
  "Deepika",
  "Padma",
  "Saranya",
  "Pavithra",
  "Keerthi",
  "Fatima",
  "Ayesha",
  "Zara",
  "Mariam",
  "Sana",
  "Hina",
  "Noor",
  "Amina",
  "Rabia",
  "Yasmin",
];
const lastNames = [
  "Sharma",
  "Verma",
  "Gupta",
  "Singh",
  "Kumar",
  "Patel",
  "Reddy",
  "Nair",
  "Iyer",
  "Menon",
  "Das",
  "Sen",
  "Bose",
  "Roy",
  "Mukherjee",
  "Chatterjee",
  "Banerjee",
  "Ghosh",
  "Pillai",
  "Rao",
  "Joshi",
  "Kulkarni",
  "Deshmukh",
  "Patil",
  "Thakur",
  "Srivastava",
  "Mishra",
  "Pandey",
  "Tiwari",
  "Dubey",
  "Khan",
  "Ali",
  "Hussain",
  "Shaikh",
  "Malik",
  "Ansari",
  "Siddiqui",
  "Qureshi",
  "Ahmed",
  "Rahman",
  "Rajan",
  "Nambiar",
  "Warrier",
  "Kaur",
  "Bhat",
  "Hegde",
  "Shetty",
  "Acharya",
  "Mahajan",
  "Kapoor",
];
const cities = [
  "Mumbai, Maharashtra",
  "Delhi, NCR",
  "Chennai, Tamil Nadu",
  "Bangalore, Karnataka",
  "Hyderabad, Telangana",
  "Pune, Maharashtra",
  "Kolkata, West Bengal",
  "Ahmedabad, Gujarat",
  "Jaipur, Rajasthan",
  "Lucknow, Uttar Pradesh",
  "Kochi, Kerala",
  "Coimbatore, Tamil Nadu",
  "Bhopal, Madhya Pradesh",
  "Chandigarh, Punjab",
  "Indore, Madhya Pradesh",
  "Thiruvananthapuram, Kerala",
  "Visakhapatnam, Andhra Pradesh",
  "Nagpur, Maharashtra",
  "Mysore, Karnataka",
  "Madurai, Tamil Nadu",
];
const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const hospitals = [
  "MediVault Centre Hospital",
  "Apollo Hospitals",
  "Fortis Healthcare",
  "AIIMS Delhi",
  "Manipal Hospital",
  "Narayana Health",
  "Max Super Speciality",
  "Medanta The Medicity",
  "Kokilaben Hospital",
  "CMC Vellore",
  "KIMS Hospital",
  "Amrita Hospital",
];
const doctorFirst = [
  "Anand",
  "Meena",
  "Suresh",
  "Priya",
  "Rajiv",
  "Lakshmi",
  "Karthik",
  "Deepa",
  "Vikram",
  "Nandini",
  "Sanjay",
  "Kavitha",
  "Arjun",
  "Sneha",
  "Rahul",
  "Divya",
];
const doctorLast = [
  "Kumar",
  "Iyer",
  "Menon",
  "Verma",
  "Nair",
  "Raman",
  "Sharma",
  "Patel",
  "Reddy",
  "Das",
];
const specialties = [
  "Internal Medicine",
  "Cardiology",
  "Endocrinology",
  "Pulmonology",
  "Orthopedics",
  "General Medicine",
  "Neurology",
  "Nephrology",
  "Gastroenterology",
  "Oncology",
];

const chronicPool = [
  "Type 2 Diabetes",
  "Hypertension",
  "Asthma",
  "COPD",
  "Hypothyroidism",
  "Chronic Kidney Disease",
  "Coronary Artery Disease",
  "Osteoarthritis",
];
const allergyPool = [
  "Penicillin",
  "Aspirin",
  "Sulfa drugs",
  "Ibuprofen",
  "Codeine",
  "Iodine contrast",
  "Latex",
  "Metformin",
];
const surgeryPool = [
  "Appendectomy",
  "Cholecystectomy",
  "Cardiac Bypass",
  "Hip Replacement",
  "Knee Replacement",
  "Cesarean Section",
  "Hernia Repair",
  "Cataract Surgery",
];
const familyPool = [
  "Diabetes",
  "Heart Disease",
  "Cancer",
  "Hypertension",
  "Stroke",
  "Kidney Disease",
];
const diagnosisPool = [
  "Type 2 Diabetes",
  "Hypertension",
  "Pneumonia",
  "Fracture - Femur",
  "Acute Bronchitis",
  "Urinary Tract Infection",
  "Dengue Fever",
  "Acute Gastroenteritis",
  "Migraine",
  "Iron Deficiency Anemia",
  "COPD Exacerbation",
  "Acute Coronary Syndrome",
  "Thyroid Disorder",
  "Osteoarthritis Knee",
  "Lower Back Pain",
  "Viral Fever",
  "Asthma Exacerbation",
  "Chronic Kidney Disease Stage 3",
  "Hyperlipidemia",
  "Diabetic Neuropathy",
  "Cellulitis",
  "Malaria",
  "Typhoid Fever",
  "Routine Health Checkup",
  "Post-Surgical Follow-up",
];
const visitReasons = [
  "Routine Checkup",
  "Emergency",
  "Follow-up",
  "Consultation",
  "Annual Screening",
];

// Medication pools by condition
const diabetesMeds = [
  { name: "Metformin", dosage: "500mg twice daily" },
  { name: "Glimepiride", dosage: "1mg once daily before breakfast" },
  { name: "Sitagliptin", dosage: "100mg once daily" },
  { name: "Insulin Glargine", dosage: "10 units subcutaneous at bedtime" },
  { name: "Empagliflozin", dosage: "10mg once daily" },
];
const htMeds = [
  { name: "Amlodipine", dosage: "5mg once daily" },
  { name: "Telmisartan", dosage: "40mg once daily" },
  { name: "Losartan", dosage: "50mg once daily" },
  { name: "Metoprolol", dosage: "25mg twice daily" },
  { name: "Hydrochlorothiazide", dosage: "12.5mg once daily" },
];
const asthmaMeds = [
  { name: "Salbutamol Inhaler", dosage: "100mcg 2 puffs PRN" },
  { name: "Budesonide Inhaler", dosage: "200mcg twice daily" },
  { name: "Montelukast", dosage: "10mg once daily at bedtime" },
];
const generalMeds = [
  { name: "Paracetamol", dosage: "650mg thrice daily for 5 days" },
  { name: "Pantoprazole", dosage: "40mg once daily before breakfast" },
  { name: "Cetirizine", dosage: "10mg once daily" },
  { name: "Azithromycin", dosage: "500mg once daily for 5 days" },
  { name: "Amoxicillin", dosage: "500mg thrice daily for 7 days" },
  { name: "Ibuprofen", dosage: "400mg twice daily after food" },
  { name: "Calcium + Vitamin D", dosage: "500mg once daily" },
  { name: "Iron Supplement", dosage: "325mg once daily" },
  { name: "Vitamin B12", dosage: "1500mcg once daily" },
  { name: "Atorvastatin", dosage: "20mg once daily at bedtime" },
  { name: "Rosuvastatin", dosage: "10mg once daily" },
  { name: "Omeprazole", dosage: "20mg twice daily" },
  { name: "Gabapentin", dosage: "300mg thrice daily" },
  { name: "Prednisolone", dosage: "40mg once daily tapering" },
];
const xrayFindings = [
  "Normal chest radiograph",
  "Normal - No acute findings",
  "Mild cardiomegaly noted",
  "Bilateral pulmonary infiltrates",
  "Right lower lobe consolidation - suggestive of pneumonia",
  "Hyperinflated lungs - consistent with COPD",
  "Fracture of right femur shaft",
  "Degenerative changes in lumbar spine",
  "Left pleural effusion - moderate",
  "Normal skeletal survey",
  "Osteopenic changes noted",
  "Widened mediastinum - correlate clinically",
];
const ctFindings = [
  "Normal CT findings",
  "No acute intracranial abnormality",
  "Small hepatic cyst - benign",
  "Mild fatty liver changes",
  "Renal calculus - left kidney 4mm",
  "Lumbar disc herniation L4-L5",
  "Mild cerebral atrophy - age related",
  "No pulmonary embolism detected",
  "Bilateral ground glass opacities",
  "Pancreatic calcifications noted",
];

// ─── Generate one patient ───
function generatePatient(id, profileType) {
  const isMale = chance(50);
  const gender = isMale ? "Male" : "Female";
  const firstName = pick(isMale ? maleFirst : femaleFirst);
  const lastName = pick(lastNames);
  const fullName = `${firstName} ${lastName}`;
  const age =
    profileType === "elderly"
      ? rand(60, 85)
      : profileType === "young"
        ? rand(18, 35)
        : profileType === "middle"
          ? rand(36, 59)
          : rand(18, 85);

  // Demographics
  const phone = `${pick(["98", "97", "96", "95", "94", "93", "91", "90", "88", "87", "86", "85", "70", "76", "77", "78", "79"])}${String(rand(10000000, 99999999))}`;
  const emergencyPhone = `${pick(["98", "97", "96", "95", "94", "93"])}${String(rand(10000000, 99999999))}`;
  const abha = `${rand(10, 99)}-${rand(1000, 9999)}-${rand(1000, 9999)}-${rand(1000, 9999)}`;
  const address = `${rand(1, 200)} ${pick(["MG Road", "Anna Nagar", "Sector " + rand(1, 50), "Gandhi Street", "Nehru Nagar", "Lake View Road", "Station Road", "Temple Street", "Park Avenue", "Civil Lines"])} ${pick(cities)}`;
  const emergencyContact = `${pick(isMale ? femaleFirst : maleFirst)} ${lastName}`;

  // ─── Medical Profile Logic ───
  let chronicConditions = [];
  let hasDiabetes = false;
  let hasHypertension = false;
  let hasAsthma = false;
  let hasCKD = false;
  let hasCAD = false;
  let isObese = false;

  // Based on profile type, assign conditions
  if (profileType === "diabetic" || (profileType === "chronic" && chance(60))) {
    hasDiabetes = true;
    chronicConditions.push("Type 2 Diabetes");
  }
  if (profileType === "cardiac" || (profileType === "chronic" && chance(50))) {
    hasHypertension = true;
    chronicConditions.push("Hypertension");
    if (chance(30)) {
      hasCAD = true;
      chronicConditions.push("Coronary Artery Disease");
    }
  }
  if (profileType === "respiratory" || chance(10)) {
    hasAsthma = true;
    chronicConditions.push("Asthma");
  }
  if (age > 55 && chance(15)) {
    chronicConditions.push("Hypothyroidism");
  }
  if (age > 60 && chance(10)) {
    hasCKD = true;
    chronicConditions.push("Chronic Kidney Disease");
  }
  if (age > 50 && chance(15)) {
    chronicConditions.push("Osteoarthritis");
  }
  if (chronicConditions.length === 0) chronicConditions.push("None");

  // Allergies
  let allergies = [];
  if (chance(25)) allergies = pickN(allergyPool, rand(1, 2));
  if (allergies.length === 0) allergies.push("None");

  // Surgeries
  let surgeries = [];
  if (age > 40 && chance(30)) surgeries = pickN(surgeryPool, rand(1, 2));
  if (surgeries.length === 0) surgeries.push("None");

  // Family history
  let family = [];
  if (hasDiabetes && chance(70)) family.push("Diabetes");
  if (hasHypertension && chance(60)) family.push("Heart Disease");
  if (chance(15)) family.push("Cancer");
  if (chance(20)) family.push("Hypertension");
  if (family.length === 0) family.push("None");

  const smoking =
    age > 25 ? pick(["Never", "Never", "Never", "Former", "Current"]) : "Never";
  const alcohol =
    age > 21
      ? pick(["None", "None", "Occasional", "Occasional", "Regular"])
      : "None";

  // ─── Vitals ───
  // Height/Weight/BMI
  const heightCm = isMale ? rand(160, 185) : rand(148, 172);
  let weight;
  if (profileType === "obese" || (hasDiabetes && chance(50))) {
    isObese = true;
    weight = rand(85, 120);
  } else if (profileType === "healthy") {
    weight = isMale ? rand(60, 80) : rand(48, 65);
  } else {
    weight = isMale ? rand(55, 100) : rand(45, 85);
  }
  const bmi = parseFloat((weight / (heightCm / 100) ** 2).toFixed(1));

  let heartRate, systolic, diastolic, temp, respRate, spo2;

  if (profileType === "critical") {
    // Critical patient — abnormal vitals
    heartRate = pick([rand(40, 55), rand(110, 145)]);
    systolic = pick([rand(75, 88), rand(165, 210)]);
    diastolic = pick([rand(45, 58), rand(95, 120)]);
    temp = pick([randFloat(35.0, 36.0), randFloat(38.5, 40.5)]);
    respRate = pick([rand(8, 11), rand(25, 38)]);
    spo2 = rand(80, 92);
  } else if (hasHypertension) {
    heartRate = rand(72, 98);
    systolic = rand(135, 165);
    diastolic = rand(85, 100);
    temp = randFloat(36.5, 37.2);
    respRate = rand(14, 20);
    spo2 = rand(95, 99);
  } else if (hasAsthma && chance(40)) {
    heartRate = rand(80, 105);
    systolic = rand(110, 135);
    diastolic = rand(70, 85);
    temp = randFloat(36.5, 37.5);
    respRate = rand(18, 28);
    spo2 = rand(88, 96);
  } else {
    heartRate = rand(62, 90);
    systolic = rand(105, 135);
    diastolic = rand(65, 85);
    temp = randFloat(36.4, 37.3);
    respRate = rand(14, 18);
    spo2 = rand(96, 100);
  }

  // ─── Diagnosis ───
  let primaryDiag;
  if (hasDiabetes && chance(40))
    primaryDiag = pick([
      "Type 2 Diabetes",
      "Diabetic Neuropathy",
      "Hyperlipidemia",
    ]);
  else if (hasHypertension && chance(35))
    primaryDiag = pick(["Hypertension", "Acute Coronary Syndrome"]);
  else if (hasAsthma && chance(40)) primaryDiag = "Asthma Exacerbation";
  else if (profileType === "critical")
    primaryDiag = pick([
      "Acute Coronary Syndrome",
      "Pneumonia",
      "Dengue Fever",
      "Acute Kidney Injury",
    ]);
  else primaryDiag = pick(diagnosisPool);

  const diagDate = fmtDate(randomDate(180, 1));
  const severity =
    profileType === "critical"
      ? "Severe"
      : profileType === "healthy"
        ? "Mild"
        : pick(["Mild", "Mild", "Moderate", "Moderate", "Severe"]);

  // ─── Medications ───
  let meds = [];
  if (hasDiabetes) meds.push(...pickN(diabetesMeds, rand(1, 2)));
  if (hasHypertension) meds.push(...pickN(htMeds, rand(1, 2)));
  if (hasAsthma) meds.push(...pickN(asthmaMeds, rand(1, 2)));
  // Fill up to 3 with general
  while (meds.length < 3) {
    const gm = pick(generalMeds);
    if (!meds.find((m) => m.name === gm.name)) meds.push(gm);
  }
  meds = meds.slice(0, 3);

  // ─── Lab Results ───
  let hba1c,
    fastingGlucose,
    cholesterol,
    hdl,
    ldl,
    triglycerides,
    creatinine,
    wbc,
    hgb;

  if (hasDiabetes) {
    hba1c = randFloat(6.8, 11.0);
    fastingGlucose = rand(120, 280);
  } else {
    hba1c = randFloat(4.2, 6.2);
    fastingGlucose = rand(72, 105);
  }

  if (hasCAD || isObese) {
    cholesterol = rand(200, 310);
    hdl = rand(28, 42);
    ldl = rand(110, 190);
    triglycerides = rand(155, 350);
  } else {
    cholesterol = rand(130, 210);
    hdl = rand(40, 75);
    ldl = rand(60, 130);
    triglycerides = rand(70, 160);
  }

  if (hasCKD) {
    creatinine = randFloat(1.8, 5.5);
  } else if (profileType === "critical") {
    creatinine = randFloat(1.3, 3.0);
  } else {
    creatinine = randFloat(0.6, 1.2);
  }

  if (profileType === "critical") {
    wbc = pick([rand(1500, 3500), rand(12000, 25000)]);
  } else {
    wbc = rand(4200, 10500);
  }

  if (isMale) {
    hgb =
      profileType === "critical" ? randFloat(7.0, 11.0) : randFloat(13.0, 17.0);
  } else {
    hgb =
      profileType === "critical" ? randFloat(6.5, 10.0) : randFloat(11.5, 15.5);
  }

  const lastLabDate = fmtDate(randomDate(60, 1));

  // ─── Visit info ───
  const lastVisitDate = fmtDate(randomDate(90, 0));
  const visitReason =
    profileType === "critical"
      ? "Emergency"
      : profileType === "healthy"
        ? pick(["Routine Checkup", "Annual Screening"])
        : pick(visitReasons);
  const doctor = `Dr. ${pick(doctorFirst)} ${pick(doctorLast)}`;
  const hospital = pick(hospitals);

  // ─── Imaging ───
  const xrayDone = chance(55) ? "Yes" : "No";
  const xrayDate = xrayDone === "Yes" ? fmtDate(randomDate(120, 1)) : "";
  let xrayFinding = "";
  if (xrayDone === "Yes") {
    if (profileType === "healthy") xrayFinding = "Normal chest radiograph";
    else if (primaryDiag.includes("Pneumonia"))
      xrayFinding = "Right lower lobe consolidation - suggestive of pneumonia";
    else if (primaryDiag.includes("COPD") || hasAsthma)
      xrayFinding =
        "Hyperinflated lungs - consistent with obstructive airway disease";
    else if (primaryDiag.includes("Fracture"))
      xrayFinding = "Fracture of right femur shaft";
    else xrayFinding = pick(xrayFindings);
  }

  const ctDone = chance(25) ? "Yes" : "No";
  let ctFinding = "";
  if (ctDone === "Yes") {
    if (profileType === "healthy") ctFinding = "Normal CT findings";
    else ctFinding = pick(ctFindings);
  }

  // ─── Risk Scores ───
  // Early Warning Score (simplified NEWS-like: 0-15)
  let ews = 0;
  if (heartRate < 51 || heartRate > 130) ews += 3;
  else if (heartRate < 61 || heartRate > 110) ews += 2;
  else if (heartRate > 90) ews += 1;

  if (systolic < 90) ews += 3;
  else if (systolic < 100 || systolic > 170) ews += 2;
  else if (systolic > 150) ews += 1;

  if (temp < 35.5 || temp > 39.0) ews += 3;
  else if (temp < 36.0 || temp > 38.5) ews += 2;
  else if (temp > 37.5) ews += 1;

  if (respRate < 9 || respRate > 30) ews += 3;
  else if (respRate < 12 || respRate > 24) ews += 2;
  else if (respRate > 20) ews += 1;

  if (spo2 < 88) ews += 3;
  else if (spo2 < 92) ews += 2;
  else if (spo2 < 96) ews += 1;

  const diabetesRisk = hasDiabetes
    ? "High"
    : hba1c > 5.7 || fastingGlucose > 100 || bmi > 30
      ? "Medium"
      : "Low";

  const cardiacRisk = hasCAD
    ? "High"
    : hasHypertension || cholesterol > 240 || smoking === "Current" || age > 60
      ? "Medium"
      : "Low";

  // ─── Metadata ───
  const regDate = fmtDate(randomDate(1800, 30));
  const status = chance(95) ? "Active" : "Inactive";
  const consent = chance(97) ? "Yes" : "No";
  const sharedWith = chance(30)
    ? pickN(
        hospitals.filter((h) => h !== hospital),
        rand(1, 2),
      ).join("; ")
    : "None";
  const lastUpdated = fmtDateTime(randomDate(30, 0));

  return {
    PatientID: `MED-${padId(id)}`,
    FullName: fullName,
    Age: age,
    Gender: gender,
    BloodType: pick(bloodTypes),
    PhoneNumber: phone,
    Address: address,
    EmergencyContact: `${emergencyContact} (${emergencyPhone})`,
    ABHAId: abha,
    HeartRate: heartRate,
    SystolicBP: systolic,
    DiastolicBP: diastolic,
    Temperature: temp,
    RespiratoryRate: respRate,
    OxygenSaturation: spo2,
    BMI: bmi,
    Weight: weight,
    Height: heightCm,
    ChronicConditions: chronicConditions.join("; "),
    Allergies: allergies.join("; "),
    PreviousSurgeries: surgeries.join("; "),
    FamilyHistory: family.join("; "),
    SmokingStatus: smoking,
    AlcoholConsumption: alcohol,
    PrimaryDiagnosis: primaryDiag,
    DiagnosisDate: diagDate,
    Severity: severity,
    Medication1: meds[0]?.name || "",
    Medication1Dosage: meds[0]?.dosage || "",
    Medication2: meds[1]?.name || "",
    Medication2Dosage: meds[1]?.dosage || "",
    Medication3: meds[2]?.name || "",
    Medication3Dosage: meds[2]?.dosage || "",
    HemoglobinA1C: hba1c,
    FastingGlucose: fastingGlucose,
    TotalCholesterol: cholesterol,
    HDL: hdl,
    LDL: ldl,
    Triglycerides: triglycerides,
    Creatinine: creatinine,
    WBCCount: wbc,
    Hemoglobin: hgb,
    LastLabDate: lastLabDate,
    LastVisitDate: lastVisitDate,
    LastVisitReason: visitReason,
    AttendingDoctor: doctor,
    Hospital: hospital,
    XRayDone: xrayDone,
    XRayDate: xrayDate,
    XRayFindings: xrayFinding,
    CTScanDone: ctDone,
    CTScanFindings: ctFinding,
    EarlyWarningScore: ews,
    DiabetesRiskLevel: diabetesRisk,
    CardiacRiskLevel: cardiacRisk,
    RegistrationDate: regDate,
    RecordStatus: status,
    ConsentGiven: consent,
    DataSharedWith: sharedWith,
    LastUpdated: lastUpdated,
  };
}

// ─── Main: generate 75 patients with profile distribution ───
const profiles = [];
// 8 critical patients
for (let i = 0; i < 8; i++) profiles.push("critical");
// 12 diabetic
for (let i = 0; i < 12; i++) profiles.push("diabetic");
// 10 cardiac/hypertensive
for (let i = 0; i < 10; i++) profiles.push("cardiac");
// 5 respiratory
for (let i = 0; i < 5; i++) profiles.push("respiratory");
// 5 obese
for (let i = 0; i < 5; i++) profiles.push("obese");
// 8 chronic (mixed)
for (let i = 0; i < 8; i++) profiles.push("chronic");
// 15 healthy
for (let i = 0; i < 15; i++) profiles.push("healthy");
// 12 misc ages
for (let i = 0; i < 4; i++) profiles.push("young");
for (let i = 0; i < 4; i++) profiles.push("middle");
for (let i = 0; i < 4; i++) profiles.push("elderly");

// Shuffle
profiles.sort(() => 0.5 - Math.random());

const patients = profiles.map((p, i) => generatePatient(i + 1, p));

// ─── Build CSV ───
const instructions = `# SYNTHETIC PATIENT MEDICAL RECORDS DATASET
# For MediVault Project - Testing & Demonstration
#
# HOW TO VIEW IN EXCEL:
#
# METHOD 1 - Direct Open:
# 1. Locate the file: patient_medical_records.csv
# 2. Right-click on the file
# 3. Select "Open with" > "Microsoft Excel"
# 4. Data will automatically load in Excel
#
# METHOD 2 - Import into Excel:
# 1. Open Microsoft Excel (blank workbook)
# 2. Go to: File > Open > Browse
# 3. Change file type filter to "All Files (*.*)"
# 4. Select: patient_medical_records.csv
# 5. Click: Open
# 6. Excel will load the data with columns properly separated
#
# METHOD 3 - Drag and Drop:
# 1. Open Microsoft Excel (blank workbook)
# 2. Drag the patient_medical_records.csv file directly into Excel window
# 3. File will open automatically
#
# IF DATA APPEARS IN SINGLE COLUMN (Not Separated):
# 1. Select Column A (where all data appears)
# 2. Go to: Data tab > Text to Columns
# 3. Choose: "Delimited"
# 4. Check: "Comma" checkbox
# 5. Click: Finish
# 6. Data will now spread across proper columns
#
# ALTERNATE - Open with Google Sheets:
# 1. Go to: https://sheets.google.com
# 2. Click: File > Import
# 3. Upload: patient_medical_records.csv
# 4. Choose: "Comma" as separator
# 5. Click: Import data
# 6. View in browser; can download as Excel later
#
# Dataset contains ${patients.length} complete patient records for system testing.
# All data is synthetic - no real patient information.
# Generated on: ${new Date().toISOString().slice(0, 10)}
`;

const headers = Object.keys(patients[0]);

// Escape CSV values
function csvVal(v) {
  const s = String(v);
  if (
    s.includes(",") ||
    s.includes('"') ||
    s.includes("\n") ||
    s.includes(";")
  ) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const rows = patients.map((p) => headers.map((h) => csvVal(p[h])).join(","));
const csv = instructions + headers.join(",") + "\n" + rows.join("\n") + "\n";

const outPath = path.join(__dirname, "patient_medical_records.csv");
fs.writeFileSync(outPath, csv, "utf-8");
console.log(`✅ Generated ${patients.length} patient records`);
console.log(`📁 Saved to: ${outPath}`);
console.log(`📊 Columns: ${headers.length}`);
console.log(`\nProfile distribution:`);
const counts = {};
profiles.forEach((p) => (counts[p] = (counts[p] || 0) + 1));
Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${k}: ${v} patients`));
