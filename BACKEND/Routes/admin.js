const express = require("express");
const route = express.Router();
const bcrypt = require("bcrypt");
const AdminScheme = require("../Models/AdminSchema");
const jwt = require("jsonwebtoken");
const DoctorScheme = require("../Models/DoctorScheme");
const Middleware = require("../Middleware/middleware");
const { verifyToken, authorize } = require("../Middleware/rbac");
const NurseScheme = require("../Models/NurseScheme");
const ScanCenterSchema = require("../Models/ScanCenter");
const PatientSchemas = require("../Models/PatientsSchema");
const RegisterationMail = require("../Mail/SendRegisterMail");
const GoogleVerifyToken = require("../Middleware/GoogleVerifyToken");

// -------------------- ADMIN REGISTER --------------------
route.post("/register", async (req, res) => {
  try {
    const {
      hospitalName,
      ownerName,
      email,
      password,
      address,
      phone,
      timings,
      closedOn,
      logo,
      specialties,
      numberOfBeds,
    } = req.body;

    const check = await AdminScheme.findOne({ email });
    if (check) {
      return res.json({ msg: "Admin already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new AdminScheme({
      hospitalName,
      ownerName,
      email,
      password: hashedPassword,
      address,
      phone,
      timings,
      closedOn,
      logo,
      specialties,
      numberOfBeds,
    });

    await newAdmin.save();

    const token = jwt.sign(
      { email: newAdmin.email, id: newAdmin._id, role: "admin" },
      "this is your secret key to login in bro",
      { expiresIn: "1d" },
    );

    return res.json({
      msg: "Registration successful",
      token,
      ID: newAdmin._id,
      HospitalName: newAdmin.hospitalName,
      Image: newAdmin.logo,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error occurred during registration" });
  }
});

// -------------------- ADMIN LOGIN --------------------

route.post("/login", async (req, res) => {
  try {
    const { adminuser, email, password } = req.body;
    const userEmail = (adminuser || email).trim(); // Accept both field names
    console.log("🟢 Login request received:", userEmail);

    // Case-insensitive search
    const Admin = await AdminScheme.findOne({
      email: { $regex: new RegExp(`^${userEmail}$`, "i") },
    });

    if (!Admin) {
      console.log("❌ Admin not found for email:", userEmail);
      return res.json({ msg: "You are Not Authorized" });
    }

    console.log("🔐 Attempting password comparison:");
    console.log("   Input password:", password);
    console.log("   Password length:", password ? password.length : 0);
    console.log("   Hash from DB:", Admin.password.substring(0, 30) + "...");

    // DEBUG: Prepare debug info
    const debugInfo = {
      inputPwd: password,
      pwdLength: password ? password.length : 0,
      pwdType: typeof password,
      hash: Admin.password.substring(0, 40),
    };

    const check = await bcrypt.compare(password, Admin.password);
    console.log("   Password match result:", check);

    if (check) {
      const token = jwt.sign(
        { Email: Admin.email, id: Admin._id, role: "admin" },
        "this is your secret key to login in bro",
        { expiresIn: "1d" },
      );

      console.log("✅ Login successful for:", Admin.email);
      return res.json({
        msg: "Login successful",
        token: token,
        ID: Admin._id,
        Image: Admin.logo,
        HospitalName: Admin.hospitalName,
        isVerified: Admin.isVerified,
      });
    } else {
      console.log("⚠️ Wrong password for:", userEmail);
      return res.json({ msg: "Wrong Password", debug: debugInfo }); // TEMP DEBUG
    }
  } catch (err) {
    console.error("❌ Internal error in Admin Login:", err);
    return res.status(500).json({
      msg: "Internal Server Error",
      error: err.message,
    });
  }
});

// -------------------- GET DASHBOARD STATS --------------------
route.get(
  "/getdashboardstats",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    try {
      // For now, we return global counts as patients don't have AdminID
      // and we want to see total system usage
      const doctorCount = await DoctorScheme.countDocuments();
      const nurseCount = await NurseScheme.countDocuments();
      const scanCenterCount = await ScanCenterSchema.countDocuments();
      const patientCount = await PatientSchemas.countDocuments();

      return res.json({
        msg: "Stats received",
        totalDoctors: doctorCount,
        totalNurses: nurseCount,
        totalScanCenters: scanCenterCount,
        totalPatients: patientCount,
      });
    } catch (err) {
      console.error("Stats error:", err);
      res.status(500).json({ msg: "Error fetching stats" });
    }
  },
);

// -------------------- GET COUNT (Legacy) --------------------
route.post("/getcount", Middleware, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ msg: "Admin ID is required" });
    }

    const doctors = await DoctorScheme.find({ AdminID: id });
    const nurses = await NurseScheme.find({ AdminID: id });
    const scancenters = await ScanCenterSchema.find({ AdminID: id });
    const patients = await PatientSchemas.find({ AdminID: id });

    return res.json({
      msg: "Count received",
      Doctors: doctors.length,
      Nurses: nurses.length,
      Scancenters: scancenters.length,
      Patients: patients.length,
    });
  } catch (err) {
    console.error("Count error:", err);
    res.json({ msg: "Error Occurred" });
  }
});

// -------------------- PASSWORD CHANGE --------------------
route.post("/passwordchange", async (req, res) => {
  try {
    const { oldPassword, newPassword, id } = req.body;
    const find = await AdminScheme.findById(id);
    if (!find) return res.json({ msg: "No User Found" });

    const pass = await bcrypt.compare(oldPassword, find.password);
    if (!pass) return res.json({ msg: "Password Incorrect" });

    const hashpassword = await bcrypt.hash(newPassword, 10);
    await AdminScheme.findByIdAndUpdate(
      { _id: id },
      { password: hashpassword },
    );
    return res.json({ msg: "PasswordChanged" });
  } catch (err) {
    res.json({ msg: err });
  }
});

// -------------------- ADD DOCTOR --------------------
route.post(
  "/postbyadmin",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    const {
      Admin,
      Doctor_name,
      gender,
      DOB,
      Email_Address,
      Current_Address,
      Qualifications,
      Specialization,
      Medical_License_Number,
      Medical_Council_Registration_Number,
      Years_of_experience,
      Contract_type,
      photo,
      phoneno,
    } = req.body;

    try {
      const currentdatetime = new Date();
      const currentdate = currentdatetime.toLocaleDateString();
      const currenttime = currentdatetime.toLocaleTimeString();
      const currentday = currentdatetime.toLocaleString("en-US", {
        weekday: "long",
      });

      const hashpassword = await bcrypt.hash(Medical_License_Number, 10);
      const doctor = new DoctorScheme({
        AdminID: Admin,
        Doctor_name,
        Gender: gender,
        DOB,
        Image: photo,
        Email_Address,
        Current_Address,
        Qualifications,
        Specialization,
        Medical_License_Number,
        Medical_Council_Registration_Number,
        Years_of_experience,
        Contract_type,
        Date_Joined: currentdate,
        Time_Joined: currenttime,
        Day_Joined: currentday,
        PhoneNo: phoneno,
        Password: hashpassword,
      });
      RegisterationMail(Email_Address);
      await doctor.save();
      res.json({ msg: "Details are saved successfully" });
    } catch (err) {
      res.json({ msg: "Error occurred in adddoctor" });
    }
  },
);

// -------------------- ADD NURSE --------------------
route.post(
  "/postbyadminfornurse",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const {
        Admin,
        Doctor_name,
        gender,
        DOB,
        Email_Address,
        Current_Address,
        Qualifications,
        Specialization,
        Medical_License_Number,
        Medical_Council_Registration_Number,
        Years_of_experience,
        photo,
      } = req.body;

      const currentdatetime = new Date();
      const currentdate = currentdatetime.toLocaleDateString();
      const currenttime = currentdatetime.toLocaleTimeString();
      const currentday = currentdatetime.toLocaleString("en-US", {
        weekday: "long",
      });

      const hashpassword = await bcrypt.hash(Medical_License_Number, 10);
      const nurse = new NurseScheme({
        AdminID: Admin,
        Doctor_name,
        Gender: gender,
        DOB,
        Image: photo,
        Email_Address,
        Current_Address,
        Qualifications,
        Specialization,
        Medical_License_Number,
        Medical_Council_Registration_Number,
        Years_of_experience,
        Date_Joined: currentdate,
        Time_Joined: currenttime,
        Day_Joined: currentday,
        Password: hashpassword,
      });
      RegisterationMail(Email_Address);
      await nurse.save();
      res.json({ msg: "Details are saved successfully" });
    } catch (err) {
      res.json({ msg: "Error occurred in addnurse" });
    }
  },
);

// -------------------- GET ALL DOCTORS --------------------
route.post(
  "/getalldetailsofdoctor",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const { Admin } = req.body;
      const details = await DoctorScheme.find({ AdminID: Admin });
      if (details.length)
        return res.json({ msg: "Details are shown below", details });
      res.json({ msg: "No Details are found" });
    } catch (err) {
      res.json({ msg: "Error occurred in getting details" });
    }
  },
);

// -------------------- GET ALL NURSES --------------------
route.post(
  "/getalldetailsofnurse",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const { Admin } = req.body;
      const details = await NurseScheme.find({ AdminID: Admin });
      if (details.length)
        return res.json({ msg: "Details are shown below", details });
      res.json({ msg: "No Details are found" });
    } catch (err) {
      res.json({ msg: "Error occurred in getting details" });
    }
  },
);

// -------------------- DELETE DOCTOR --------------------
route.post(
  "/deletedetail",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const { Medical_License_Number } = req.body;
      const check = await DoctorScheme.findOneAndDelete({
        Medical_License_Number,
      });
      if (check) return res.json({ msg: "Delete Successfully" });
      res.json({ msg: "Doctor not found" });
    } catch (err) {
      console.error("Error deleting doctor:", err);
      res.status(500).json({ msg: "Error occurred while deleting doctor" });
    }
  },
);

// -------------------- DELETE NURSE --------------------
route.post(
  "/deletedetailnurse",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const { Medical_License_Number } = req.body;
      const check = await NurseScheme.findOneAndDelete({
        Medical_License_Number,
      });
      if (check) return res.json({ msg: "Delete Successfully" });
      res.json({ msg: "Nurse not found" });
    } catch (err) {
      console.error("Error deleting nurse:", err);
      res.status(500).json({ msg: "Error occurred while deleting nurse" });
    }
  },
);

// -------------------- ADD SCAN CENTER --------------------
route.post(
  "/postforscancenter",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const {
        Admin,
        Doctor_name,
        gender,
        DOB,
        Email_Address,
        Current_Address,
        Qualifications,
        Specialization,
        Medical_License_Number,
        Medical_Council_Registration_Number,
        Years_of_experience,
        photo,
      } = req.body;

      const currentdatetime = new Date();
      const currentdate = currentdatetime.toLocaleDateString();
      const currenttime = currentdatetime.toLocaleTimeString();
      const currentday = currentdatetime.toLocaleString("en-US", {
        weekday: "long",
      });

      const hashpassword = await bcrypt.hash(Medical_License_Number, 10);
      const scancenter = new ScanCenterSchema({
        AdminID: Admin,
        username: Doctor_name,
        Password: hashpassword,
        Gender: gender,
        DOB,
        Image: photo,
        Email_Address,
        Current_Address,
        Qualifications,
        Specialization,
        Medical_License_Number,
        Medical_Council_Registration_Number,
        Years_of_experience,
        Date_Joined: currentdate,
        Time_Joined: currenttime,
        Day_Joined: currentday,
      });
      RegisterationMail(Email_Address);
      await scancenter.save();
      res.json({ msg: "Details are saved successfully" });
    } catch (err) {
      res.json({ msg: "Error occurred in addscan" });
    }
  },
);

// -------------------- GET SCAN CENTERS --------------------
route.post("/getallScancenter", async (req, res) => {
  try {
    const { Admin } = req.body;
    const details = await ScanCenterSchema.find({ AdminID: Admin });
    if (!details.length) return res.json({ msg: "No records Found" });
    res.json({ msg: "Details are shown below", result: details });
  } catch (err) {
    res.json({ msg: "Error occurred in deleting detail" });
  }
});

// -------------------- DELETE SCAN CENTER --------------------
route.post(
  "/deletescancenter",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const { Medical_License_Number } = req.body;
      const deleted = await ScanCenterSchema.findOneAndDelete({
        Medical_License_Number,
      });
      if (deleted) return res.json({ msg: "Delete Successfully" });
      res.json({ msg: "Scan center not found" });
    } catch (err) {
      console.error("Error deleting scan center:", err);
      res
        .status(500)
        .json({ msg: "Error occurred while deleting scan center" });
    }
  },
);

module.exports = route;
