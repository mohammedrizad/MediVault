const axios = require("axios");

// Usage:
//   Set env vars or pass as CLI args:
//   ADMIN_ID, ADMIN_JWT, BASE_URL (default http://localhost:5000)
// Example:
//   node seed_accounts.js --adminId=<id> --adminJwt=<token>

const argv = require("yargs/yargs")(process.argv.slice(2)).argv;

const BASE_URL =
  argv.baseUrl || process.env.BASE_URL || "http://localhost:5000";
const ADMIN_ID = argv.adminId || process.env.ADMIN_ID;
const ADMIN_JWT = argv.adminJwt || process.env.ADMIN_JWT;

if (!ADMIN_ID) {
  console.error(
    "ERROR: ADMIN_ID is required. Pass --adminId or set ADMIN_ID env var."
  );
  process.exit(1);
}

// Sample records (change as you like)
const doctor = {
  Admin: ADMIN_ID,
  Doctor_name: "Dr. Alice Example",
  gender: "female",
  DOB: "1985-07-23",
  Email_Address: "alice.doctor@example.test",
  Current_Address: "123 Clinic Lane",
  Qualifications: "MBBS, MD",
  Specialization: "General Medicine",
  Medical_License_Number: "DOC-ALICE-001",
  Medical_Council_Registration_Number: "REG-DOC-001",
  Years_of_experience: "8",
  Contract_type: "Full-time",
  photo: "https://placehold.co/300x300.png?text=Dr+Alice",
  phoneno: "9000000001",
};

const nurse = {
  Admin: ADMIN_ID,
  Doctor_name: "Nurse Bob Example",
  gender: "male",
  DOB: "1990-03-15",
  Email_Address: "bob.nurse@example.test",
  Current_Address: "456 Care Ave",
  Qualifications: "BSc Nursing",
  Specialization: "General",
  Medical_License_Number: "NURSE-BOB-001",
  Medical_Council_Registration_Number: "REG-NUR-001",
  Years_of_experience: "5",
  photo: "https://placehold.co/300x300.png?text=Nurse+Bob",
};

const scancenter = {
  Admin: ADMIN_ID,
  Doctor_name: "Central Scans Ltd",
  gender: "other",
  DOB: "2000-01-01",
  Email_Address: "scans@example.test",
  Current_Address: "789 Imaging Blvd",
  Qualifications: "N/A",
  Specialization: "Radiology",
  Medical_License_Number: "SCAN-001",
  Medical_Council_Registration_Number: "REG-SCAN-001",
  Years_of_experience: "12",
  photo: "https://placehold.co/300x300.png?text=Scans+Center",
};

const patient = {
  Name: "Charlie Patient",
  Address: "101 Patient Rd",
  Aadhar: "1234-5678-9012",
  Mobile_no: "9000000009",
  Photo: "https://placehold.co/300x300.png?text=Patient+Charlie",
  DOB: "1995-11-05",
  Email: "charlie.patient@example.test",
};

async function post(url, data, opts = {}) {
  try {
    const headers = opts.headers || {};
    const res = await axios.post(url, data, { headers });
    return res.data;
  } catch (err) {
    if (err.response && err.response.data) {
      console.error("Request failed:", url, err.response.data);
      return { error: err.response.data };
    }
    console.error("Request error:", err.message);
    return { error: err.message };
  }
}

async function run() {
  console.log("Base URL:", BASE_URL);

  // Create doctor
  console.log("\nCreating doctor...");
  const docRes = await post(`${BASE_URL}/admin/postbyadmin`, doctor);
  console.log("Doctor creation response:", docRes);

  // Create nurse
  console.log("\nCreating nurse...");
  const nurseRes = await post(`${BASE_URL}/admin/postbyadminfornurse`, nurse);
  console.log("Nurse creation response:", nurseRes);

  // Create scan center
  console.log("\nCreating scan center...");
  const scanRes = await post(`${BASE_URL}/admin/postforscancenter`, scancenter);
  console.log("Scan center creation response:", scanRes);

  // Create patient (requires admin middleware — include Authorization if provided)
  console.log("\nCreating patient...");
  const patientHeaders = {};
  if (ADMIN_JWT) {
    patientHeaders["Authorization"] = `Bearer ${ADMIN_JWT}`;
  } else {
    console.warn(
      "Warning: ADMIN_JWT not provided. Patient registration endpoint uses middleware and may fail without a valid admin token."
    );
  }
  const patientRes = await post(`${BASE_URL}/patient/register`, patient, {
    headers: patientHeaders,
  });
  console.log("Patient creation response:", patientRes);

  // Try logging in doctor
  console.log("\nAttempting doctor login...");
  const docLogin = await post(`${BASE_URL}/doctor/login`, {
    username: doctor.Email_Address,
    password: doctor.Medical_License_Number,
  });
  console.log("Doctor login response:", docLogin);

  // Try logging in nurse
  console.log("\nAttempting nurse login...");
  const nurseLogin = await post(`${BASE_URL}/nurse/login`, {
    username: nurse.Email_Address,
    password: nurse.Medical_License_Number,
  });
  console.log("Nurse login response:", nurseLogin);

  // Try logging in scancenter
  console.log("\nAttempting scan center login...");
  const scanLogin = await post(`${BASE_URL}/scancenter/login`, {
    username: scancenter.Email_Address,
    password: scancenter.Medical_License_Number,
  });
  console.log("Scan center login response:", scanLogin);

  // Attempt patient face-login using same Photo URL (may depend on internet and Face++ credentials configured in backend)
  console.log(
    "\nAttempting patient face login using the same Photo URL used in registration (may require external Face++ API to be reachable and valid API keys)"
  );
  const patientLogin = await post(`${BASE_URL}/patient/loginforpatient`, {
    image: patient.Photo,
  });
  console.log("Patient face-login response:", patientLogin);

  console.log(
    "\n-- Summary of credentials you can use to login (email/password):"
  );
  console.log(
    `Doctor: ${doctor.Email_Address} / ${doctor.Medical_License_Number}`
  );
  console.log(
    `Nurse: ${nurse.Email_Address} / ${nurse.Medical_License_Number}`
  );
  console.log(
    `Scan Center: ${scancenter.Email_Address} / ${scancenter.Medical_License_Number}`
  );
  console.log(
    `Patient (face login): ${patient.Email} (use image URL or upload image to patient login endpoint)`
  );
}

run().catch((err) => {
  console.error("Seed script failed:", err);
});
