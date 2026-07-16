const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { auditMiddleware } = require("./Services/auditService");

const app = express();

// Debug Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ Enable JSON parsing & CORS with increased limits for Base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ Enhanced CORS for cross-hospital access & incognito mode
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or file://)
      if (!origin) return callback(null, true);

      // Allow localhost and file:// protocol
      const allowedOrigins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
      ];

      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
        origin.startsWith("file://")
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for demo
      }
    },
    credentials: true, // Allow cookies and authorization headers
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-user-role",
      "x-auth-token",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 600, // Cache preflight requests for 10 minutes
  }),
);

// Handle preflight requests
app.options("*", cors());

// 🆕 Audit logging middleware — logs every request
app.use(auditMiddleware);

const primaryURI = process.env.MONGO_URI;
if (!primaryURI) {
  console.error("❌ MONGO_URI is not set in the environment. Create a .env file (see .env.example).");
  process.exit(1);
}
// const primaryURI = "mongodb://127.0.0.1:27017/medivault";  // Local MongoDB

// Import routes
const Admin = require("./Routes/admin");
const Doctor = require("./Routes/doctor");
const Nurse = require("./Routes/Nurse");
const Patient = require("./Routes/Patients");
const ScanCenter = require("./Routes/Scancenter");
const HospitalManagement = require("./Routes/HospitalManagement");
const AI = require("./Routes/aiRoutes");
const Counts = require("./Routes/counts");
const OTP = require("./Routes/otp"); // 🆕 Add OTP routes
const Upload = require("./Routes/uploadRoutes"); // 🆕 Add Upload routes
const Emergency = require("./Routes/emergencyRoutes"); // 🆕 Add Emergency routes
const Access = require("./Routes/accessRoutes"); // 🆕 Add Access routes
const Alerts = require("./Routes/alertRoutes"); // 🆕 Add Alert routes
const Analytics = require("./Routes/analyticsRoutes"); // 🆕 Add Analytics routes
const PEWS = require("./Routes/pewsRoutes"); // 🆕 Add PEWS routes
const Audit = require("./Routes/auditRoutes"); // 🆕 Add Audit routes
const Appointments = require("./Routes/appointmentRoutes"); // 🆕 Add Appointment routes
const Medications = require("./Routes/medicationRoutes"); // 🆕 Add Medication routes

let memoryMongoServer = null;

async function connectDatabase() {
  try {
    await mongoose.connect(primaryURI, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });
    console.log("✅ MongoDB connected");
  } catch (primaryError) {
    console.warn(
      "⚠️ Primary MongoDB unavailable. Falling back to in-memory MongoDB.",
      primaryError.message,
    );

    try {
      memoryMongoServer = await MongoMemoryServer.create({
        binary: { version: "7.0.14" },
      });
      await mongoose.connect(memoryMongoServer.getUri(), {
        dbName: "medivault",
      });
      console.log("✅ In-memory MongoDB connected");
    } catch (fallbackError) {
      console.error(
        "❌ Failed to connect to both MongoDB and fallback memory DB:",
        fallbackError,
      );
      process.exit(1);
    }
  }

  const AdminScheme = require("./Models/AdminSchema");
  const bcrypt = require("bcrypt");

  const defaultEmail = "admin@test.com";
  const defaultPassword = "12345";

  const existingAdmin = await AdminScheme.findOne({ email: defaultEmail });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const newAdmin = new AdminScheme({
      hospitalName: "MediVault Hospital",
      ownerName: "Default Admin",
      email: defaultEmail,
      password: hashedPassword,
      address: "Coimbatore",
      phone: "9876543210",
      timings: "24x7",
      closedOn: "Sunday",
      logo: "https://placehold.co/100x100",
      specialties: "General Medicine",
      numberOfBeds: 100,
    });
    await newAdmin.save();
    console.log("🆕 Default admin created:");
    console.log("   Email:", defaultEmail);
    console.log("   Password:", defaultPassword);
  } else {
    console.log("✅ Default admin already exists:", existingAdmin.email);
  }
}

connectDatabase().catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// ✅ Use all routes
app.use("/admin", Admin);
app.use("/doctor", Doctor);
app.use("/nurse", Nurse);
app.use("/patient", Patient);
app.use("/scan", ScanCenter);
app.use("/hospital", HospitalManagement);
app.use("/ai", AI);
app.use("/counts", Counts);
app.use("/otp", OTP); // 🆕 Add OTP routes
app.use("/records", Upload); // 🆕 Add Upload routes
app.use("/emergency", Emergency); // 🆕 Add Emergency routes
app.use("/access", Access); // 🆕 Add Access routes
app.use("/alerts", Alerts); // 🆕 Add Alert routes
app.use("/analytics", Analytics); // 🆕 Add Analytics routes
app.use("/pews", PEWS); // 🆕 Add PEWS routes
app.use("/audit", Audit); // 🆕 Add Audit routes
app.use("/appointments", Appointments); // 🆕 Add Appointment routes
app.use("/medications", Medications); // 🆕 Add Medication routes

// ✅ Global error handler — returns clean JSON instead of leaking stack
// traces as HTML (e.g. multer file-filter rejections).
app.use((err, req, res, next) => {
  console.error("Unhandled route error:", err);
  res.status(err.status || 500).json({
    msg: err.message || "Internal server error",
  });
});

// ✅ Start backend server
const PORT = process.env.PORT || 5002;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
