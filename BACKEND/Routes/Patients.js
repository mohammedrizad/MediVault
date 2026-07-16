const express = require("express");
const route = express.Router();
const PatientSchemas = require("../Models/PatientsSchema");
const DoctorSchema = require("../Models/DoctorScheme");
const AdminSchema = require("../Models/AdminSchema");
const currentDate = new Date();
const day = String(currentDate.getDate()).padStart(2, "0");
const month = String(currentDate.getMonth() + 1).padStart(2, "0");
const year = currentDate.getFullYear();
const Middleware = require("../Middleware/middleware");
const { verifyToken, authorize } = require("../Middleware/rbac");
const simpleFormattedDate = `${day}/${month}/${year}`;
const GoogleVerifyToken = require("../Middleware/GoogleVerifyToken");
const jwt = require("jsonwebtoken");
const awsService = require("../Services/awsService");

route.post("/register", async (req, res) => {
  // Extract data first
  const {
    firstname,
    lastname,
    name,
    email,
    phone,
    Mobile_no,
    age,
    Age,
    gender,
    Gender,
    faceImage,
    photo,
    Address,
    address,
    Aadhar,
    DOB,
    bloodGroup,
    BloodGroup,
    emergencyContact,
    EmergencyContactName,
    emergencyPhone,
    EmergencyContactNumber,
    allergies,
    Allergies,
    condition,
    ChronicConditions,
    status,
    assignedDoctor,
    doctorId,
  } = req.body;

  // Map frontend data to schema format
  const fullName =
    name ||
    (firstname && lastname
      ? `${firstname} ${lastname}`
      : firstname || lastname || "");
  const resolvedPhone = phone || Mobile_no || "";
  const resolvedPhoto = photo || faceImage || "";
  const resolvedAddress = address || Address || "";
  const resolvedAge = age || Age || "";
  const resolvedGender = gender || Gender || "";
  const resolvedBloodGroup = bloodGroup || BloodGroup || "Unknown";
  const resolvedEmergencyName = emergencyContact || EmergencyContactName || "";
  const resolvedEmergencyPhone = emergencyPhone || EmergencyContactNumber || "";
  const resolvedAllergies = allergies || Allergies || "None";
  const resolvedConditions = condition || ChronicConditions || "None";

  try {
    // --- Duplicate patient prevention ---
    // Check by Email (if provided)
    if (email) {
      const existingByEmail = await PatientSchemas.findOne({ Email: email });
      if (existingByEmail) {
        return res.status(409).json({
          msg: "A patient with this email already exists",
          existingPatient: {
            name: existingByEmail.Name,
            medicalId: existingByEmail.MedicalId,
          },
        });
      }
    }
    // Check by Phone (if provided)
    if (resolvedPhone) {
      const normalizedPhone = resolvedPhone
        .replace(/^\+91/, "")
        .replace(/\D/g, "")
        .slice(-10);
      const existingByPhone = await PatientSchemas.findOne({
        $or: [
          { Mobile_no: resolvedPhone },
          { Mobile_no: normalizedPhone },
          { Mobile_no: `+91${normalizedPhone}` },
        ],
      });
      if (existingByPhone) {
        return res.status(409).json({
          msg: "A patient with this phone number already exists",
          existingPatient: {
            name: existingByPhone.Name,
            medicalId: existingByPhone.MedicalId,
          },
        });
      }
    }
    // Check by Aadhar (if provided)
    if (Aadhar) {
      const existingByAadhar = await PatientSchemas.findOne({ Aadhar });
      if (existingByAadhar) {
        return res.status(409).json({
          msg: "A patient with this Aadhar number already exists",
          existingPatient: {
            name: existingByAadhar.Name,
            medicalId: existingByAadhar.MedicalId,
          },
        });
      }
    }

    // Generate UHID ID by finding the highest existing UHID number
    const lastPatient = await PatientSchemas.findOne(
      { MedicalId: /^UHID-/ },
      { MedicalId: 1 },
    )
      .sort({ MedicalId: -1 })
      .lean();
    let nextNum = 1001; // default start
    if (lastPatient && lastPatient.MedicalId) {
      const num = parseInt(lastPatient.MedicalId.replace("UHID-", ""), 10);
      if (!isNaN(num)) nextNum = num + 1;
    }
    const medicalId = `UHID-${nextNum}`;

    const patient = new PatientSchemas({
      Name: fullName,
      MedicalId: medicalId,
      Address: resolvedAddress,
      Mobile_no: resolvedPhone,
      Aadhar: Aadhar || "",
      Photo: resolvedPhoto,
      DOB: DOB || "",
      Age: resolvedAge,
      Gender: resolvedGender,
      Email: email || "",
      BloodGroup: resolvedBloodGroup,
      EmergencyContactName: resolvedEmergencyName,
      EmergencyContactNumber: resolvedEmergencyPhone,
      Allergies: resolvedAllergies,
      ChronicConditions: resolvedConditions,
      status: status || "Active",
      assignedDoctor: assignedDoctor || "Unassigned",
      doctorId: doctorId || "",
      History: [],
    });

    await patient.save();
    console.log("Patient saved successfully:", patient);

    // Index face in AWS Rekognition
    if (resolvedPhoto) {
      try {
        await awsService.indexFace(resolvedPhoto, patient._id);
        console.log(
          "Face indexed in AWS Rekognition for patient:",
          patient._id,
        );
      } catch (awsError) {
        console.error("AWS Rekognition Index Error:", awsError);
        // Continue with registration even if face indexing fails
      }
    }

    res.json({
      msg: "Registration Successfully Done",
      patient: {
        id: patient._id,
        medicalId: patient.MedicalId,
        name: patient.Name,
        email: patient.Email,
        phone: patient.Mobile_no,
      },
    });
  } catch (err) {
    console.error("Patient registration error:", err);

    // Handle duplicate medical ID error
    if (err.code === 11000 && err.keyPattern?.MedicalId) {
      // Retry with timestamp-based ID to ensure uniqueness
      try {
        const newMedicalId = `UHID-${Date.now().toString().slice(-6)}`;

        const patient = new PatientSchemas({
          Name: fullName,
          MedicalId: newMedicalId,
          Address: resolvedAddress,
          Mobile_no: resolvedPhone,
          Aadhar: Aadhar || "",
          Photo: resolvedPhoto,
          DOB: DOB || "",
          Age: resolvedAge,
          Gender: resolvedGender,
          Email: email || "",
          BloodGroup: resolvedBloodGroup,
          EmergencyContactName: resolvedEmergencyName,
          EmergencyContactNumber: resolvedEmergencyPhone,
          Allergies: resolvedAllergies,
          ChronicConditions: resolvedConditions,
          History: [],
        });

        await patient.save();
        console.log("Patient saved with retry:", patient);

        // Index face in AWS Rekognition (Retry Block)
        if (resolvedPhoto) {
          try {
            await awsService.indexFace(resolvedPhoto, patient._id);
            console.log(
              "Face indexed in AWS Rekognition for patient (retry):",
              patient._id,
            );
          } catch (awsError) {
            console.error("AWS Rekognition Index Error (Retry):", awsError);
          }
        }

        return res.json({
          msg: "Registration Successfully Done",
          patient: {
            id: patient._id,
            medicalId: patient.MedicalId,
            name: patient.Name,
            email: patient.Email,
            phone: patient.Mobile_no,
          },
        });
      } catch (retryErr) {
        console.error("Retry failed:", retryErr);
        return res.status(500).json({
          msg: "Error occurred in Patient Registration - ID conflict",
          error: retryErr.message,
        });
      }
    }

    res.status(500).json({
      msg: "Error occurred in Patient Registeration",
      error: err.message,
    });
  }
});

route.post("/login", async (req, res) => {
  try {
    const { image, patientId } = req.body;

    // Use AWS Rekognition
    // Note: This incurs AWS costs. Ensure image is valid before calling.
    if (!image || image.length < 100) {
      return res.json({ msg: "Invalid image data" });
    }

    const matches = await awsService.searchFace(image);

    if (!matches || matches.length === 0) {
      return res.json({ msg: "Face not recognized" });
    }

    // Filter high confidence matches
    const highConfidenceMatches = matches.filter((m) => m.confidence > 85);

    if (highConfidenceMatches.length === 0) {
      return res.json({ msg: "Face not recognized" });
    }

    // Handle duplicates
    if (highConfidenceMatches.length > 1) {
      const duplicatePatients = [];
      for (const match of highConfidenceMatches) {
        const p = await PatientSchemas.findById(match.patientId);
        if (p)
          duplicatePatients.push({
            id: p._id,
            name: p.Name,
            medicalId: p.MedicalId,
            confidence: match.confidence,
          });
      }

      return res.json({
        msg: "Multiple matching faces detected",
        requiresAdditionalAuth: true,
        matches: duplicatePatients,
        suggestedAuth: "otp",
      });
    }

    // Single match
    const bestMatch = highConfidenceMatches[0];
    const patient = await PatientSchemas.findById(bestMatch.patientId);

    if (!patient) return res.json({ msg: "Patient record not found" });

    // Verify ID if provided
    if (patientId && patient.MedicalId !== patientId) {
      return res.json({
        msg: "Face matches but ID mismatch",
        requiresAdditionalAuth: true,
        patientId: patient.MedicalId,
      });
    }

    return res.json({
      msg: "Faces match!",
      result: patient,
      confidence: bestMatch.confidence,
      authMethod: "facial",
    });
  } catch (err) {
    console.error("Facial login error:", err);
    res.status(500).json({
      msg: "Error occurred in facial authentication",
      error: err.message,
    });
  }
});

route.post("/loginforpatient", async (req, res) => {
  try {
    const { image } = req.body;
    console.log(
      "Login request received. Image length:",
      image ? image.length : "null",
    );

    // Use AWS Rekognition
    // Note: This incurs AWS costs. Ensure image is valid before calling.
    if (!image || image.length < 100) {
      console.log("Invalid image data");
      return res.json({ msg: "Invalid image data" });
    }

    const matches = await awsService.searchFace(image);
    console.log("AWS Search Matches:", matches);

    if (!matches || matches.length === 0) {
      console.log("No face found in AWS search");
      return res.json({ msg: "No face found" });
    }

    // Filter high confidence matches
    const highConfidenceMatches = matches.filter((m) => m.confidence > 70); // Lowered to 70 for testing
    console.log("High confidence matches (>70):", highConfidenceMatches);

    if (highConfidenceMatches.length === 0) {
      console.log("No high confidence matches found");
      return res.json({ msg: "No face found" });
    }

    // Get the best match
    const bestMatch = highConfidenceMatches[0];
    console.log("Best match:", bestMatch);

    const patient = await PatientSchemas.findById(bestMatch.patientId).select(
      "-History",
    );

    if (patient) {
      console.log("Patient found in DB:", patient.Name);
      const token = jwt.sign(
        { email: patient.Email, id: patient._id, role: "patient" },
        "this is your secret key to login in bro",
        { expiresIn: "1d" },
      );

      const patientData = {
        _id: patient._id,
        Name: patient.Name,
        Email: patient.Email,
        Mobile_no: patient.Mobile_no,
        Address: patient.Address,
        Aadhar: patient.Aadhar,
        DOB: patient.DOB,
        MedicalId: patient.MedicalId,
        Photo: patient.Photo,
        Gender: patient.Gender,
      };

      return res.json({
        msg: "Faces match!",
        result: patientData,
        token,
        confidence: bestMatch.confidence,
      });
    }

    return res.json({
      msg: "No face found",
    });
  } catch (err) {
    console.error("Face login error:", err);
    res.json({
      msg: "Error occurred in patients login",
      error: err.message,
    });
  }
});

// Manual login by Medical ID
route.post("/loginbyid", async (req, res) => {
  try {
    const { medicalId, password } = req.body;

    if (!medicalId || !password) {
      return res.status(400).json({
        msg: "Medical ID and password are required",
      });
    }

    // Find patient by MedicalId
    const patient = await PatientSchemas.findOne({
      MedicalId: medicalId,
    }).select("-History");

    if (!patient) {
      return res.status(404).json({
        msg: "Patient not found with this Medical ID",
      });
    }

    // For simplicity, we'll use a default password system
    // In production, you should hash passwords properly
    const defaultPassword = "patient123"; // Simple default password for all patients

    if (password !== defaultPassword) {
      return res.status(401).json({
        msg: "Invalid password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: patient.Email,
        medicalId: patient.MedicalId,
        id: patient._id,
        role: "patient",
      },
      "this is your secret key to login in bro",
      { expiresIn: "1d" },
    );

    const patientData = {
      _id: patient._id,
      Name: patient.Name,
      Email: patient.Email,
      Mobile_no: patient.Mobile_no,
      Address: patient.Address,
      Aadhar: patient.Aadhar,
      DOB: patient.DOB,
      MedicalId: patient.MedicalId,
      Photo: patient.Photo,
    };

    res.json({
      msg: "Login successful",
      patient: patientData,
      token: token,
    });
  } catch (err) {
    console.error("Manual login error:", err);
    res.status(500).json({
      msg: "Error occurred during login",
      error: err.message,
    });
  }
});

route.post("/googleauth", async (req, res) => {
  try {
    const idToken = req.body.idToken;
    if (!idToken) {
      return res
        .status(400)
        .json({ success: false, msg: "ID token is required" });
    }
    const result = await GoogleVerifyToken(idToken);
    if (!result.success) {
      return res.json({
        msg: "Google verification failed",
      });
    }
    const email = result.decodedToken.email;
    const patients = await PatientSchemas.findOne({ Email: email }).select(
      "-History",
    );
    if (patients) {
      const token = jwt.sign(
        { email, id: patients._id, role: "patient" },
        "this is your secret key to login in bro",
        { expiresIn: "1d" },
      );
      return res.json({ msg: "Username Found", result: patients, token });
    }
    return res.json({
      msg: "User Not Found",
    });
  } catch (err) {
    res.json({
      msg: "Error occurred in patients login",
    });
  }
});

route.post(
  "/entrypatient",
  verifyToken,
  authorize("doctor", "admin"),
  async (req, res) => {
    try {
      const { _id, vitals, disease } = req.body;
      const result = await PatientSchemas.findByIdAndUpdate(_id, {
        $push: {
          History: {
            disease: disease,
            notes: "",
            vitals: vitals,
            Date: simpleFormattedDate,
            Doctor: "",
            report: { placeholder: "to be updated" },
            preciption: [],
          },
        },
      });
      if (result) {
        res.json({
          msg: "Datas added successfully",
        });
      } else {
        res.json({
          msg: "Datas not saved",
        });
      }
    } catch (err) {
      res.json({
        msg: "Error Occurred in Patient Entry",
      });
    }
  },
);

route.post(
  "/notesadded",
  verifyToken,
  authorize("doctor", "admin"),
  async (req, res) => {
    try {
      const { _id, notes } = req.body;
      // const currentDate = new Date().toLocaleDateString();
      const result = await PatientSchemas.findOneAndUpdate(
        { _id, "History.Date": simpleFormattedDate },
        {
          $set: {
            "History.$.notes": notes,
          },
        },
      );
      if (result) {
        res.json({
          msg: "Notes added successfully",
        });
      } else {
        res.json({
          msg: "Notes not added",
        });
      }
    } catch (err) {
      res.json({
        msg: "Error Occurred in Notes Added",
      });
    }
  },
);

route.post(
  "/entryreport",
  verifyToken,
  authorize("doctor", "admin", "scan_center"),
  async (req, res) => {
    try {
      const { _id } = req.body;
      // const currentDate = new Date().toLocaleDateString();
      const check = await PatientSchemas.findOne({ _id });
      const result = check.History.find(
        (item) => item.Date === simpleFormattedDate,
      );
      if (result) {
        res.json({
          msg: "Entry Accepted",
          result: result,
        });
      } else {
        res.json({
          msg: "Entry Not Accepted",
        });
      }
    } catch (err) {
      res.json({
        msg: "Error occured in Entry Report",
      });
    }
  },
);
route.post(
  "/updatereport",
  verifyToken,
  authorize("doctor", "admin"),
  async (req, res) => {
    try {
      const { report, _id } = req.body;
      // const currentDate = new Date().toLocaleDateString();
      const result = await PatientSchemas.updateOne(
        { _id, "History.Date": simpleFormattedDate },
        {
          $set: {
            "History.$.report": report,
          },
        },
      );

      res.json({
        msg: "Report Added successfully",
      });
    } catch (err) {
      res.json({
        msg: "Error occured in Update Report",
      });
    }
  },
);

route.post(
  "/updateprecription",
  verifyToken,
  authorize("doctor", "admin"),
  async (req, res) => {
    try {
      const { _id, preciption, Doctor } = req.body;
      const doctor = await DoctorSchema.findById(Doctor);
      const hospital = await AdminSchema.findById(doctor.AdminID);

      const result = await PatientSchemas.findOneAndUpdate(
        { _id, "History.Date": simpleFormattedDate },
        {
          $set: {
            "History.$.preciption": preciption,
            "History.$.DoctorDetails": { doctor, hospital },
          },
        },
      );

      if (result) {
        res.json({
          msg: "Precription added successfully",
        });
      } else {
        res.json({
          msg: "Precription not added",
        });
      }
    } catch (err) {
      res.json({
        msg: "Error Occurred in Update Precription",
      });
    }
  },
);

route.post(
  "/updateDisease",
  verifyToken,
  authorize("doctor", "admin"),
  async (req, res) => {
    try {
      const { _id, disease } = req.body;
      const result = await PatientSchemas.findOneAndUpdate(
        { _id, "History.Date": simpleFormattedDate },
        {
          $set: {
            "History.$.disease": disease,
          },
        },
      );
      if (result) {
        res.json({
          msg: "Disease Updated successfully",
        });
      } else {
        res.json({
          msg: "Patient doesn't make entry",
        });
      }
    } catch (err) {
      res.json({
        msg: "Error in Update Disease",
      });
    }
  },
);

route.post(
  "/history",
  verifyToken,
  authorize("doctor", "admin", "nurse", "patient"),
  async (req, res) => {
    try {
      const { _id } = req.body;
      const result = await PatientSchemas.findById({ _id });
      if (result) {
        res.json({
          msg: "History received",
          result: result.History,
        });
      } else {
        res.json({
          msg: "No History Found",
        });
      }
    } catch (err) {
      res.json({
        msg: "Error Occurred in History page",
      });
    }
  },
);

// Get all patients for admin
route.get("/getall", async (req, res) => {
  // Temporarily removed Middleware for testing
  try {
    const patients = await PatientSchemas.find().select("-History");
    res.json({
      msg: "Patients retrieved successfully",
      result: patients, // Changed from 'patients' to 'result' to match frontend
    });
  } catch (err) {
    res.json({
      msg: "Error occurred while fetching patients",
    });
  }
});

// OTP Verification Route for Enhanced Authentication
route.post("/verify-otp", async (req, res) => {
  try {
    const { patientId, otp } = req.body;
    const incomingPhone = req.body.phone || req.body.phoneNumber || "";

    const normalizePhone = (value = "") => {
      const digits = String(value).replace(/\D/g, "");
      if (digits.startsWith("91") && digits.length === 12) {
        return digits.substring(2);
      }
      return digits;
    };

    const buildPhoneVariants = (value = "") => {
      const local = normalizePhone(value);
      const variants = [
        String(value).trim(),
        local,
        local ? `+91${local}` : "",
        local ? `91${local}` : "",
        local ? `+${local}` : "",
      ].filter(Boolean);
      return [...new Set(variants)];
    };

    // Find patient by ID or phone
    let patient;
    if (patientId) {
      patient = await PatientSchemas.findOne({
        $or: [{ MedicalId: patientId }, { _id: patientId }],
      });
    } else if (incomingPhone) {
      const phoneVariants = buildPhoneVariants(incomingPhone);
      patient = await PatientSchemas.findOne({
        Mobile_no: { $in: phoneVariants },
      });
    }

    if (!patient) {
      return res.status(404).json({
        msg: "Patient not found",
      });
    }

    // For demo purposes, accept any 4-digit OTP or specific codes
    const validOTPs = ["1234", "0000", "1111", "2222"];
    const isValidOTP = validOTPs.includes(otp) || otp.length === 4;

    if (isValidOTP) {
      // Generate JWT token
      const token = jwt.sign(
        { email: patient.Email, id: patient._id, role: "patient" },
        "this is your secret key to login in bro",
        { expiresIn: "1d" },
      );

      const patientData = {
        _id: patient._id,
        Name: patient.Name,
        Email: patient.Email,
        Mobile_no: patient.Mobile_no,
        Address: patient.Address,
        Aadhar: patient.Aadhar,
        DOB: patient.DOB,
        MedicalId: patient.MedicalId,
        Photo: patient.Photo,
      };

      return res.json({
        msg: "OTP verification successful",
        result: patientData,
        token: token,
        authMethod: "otp",
      });
    } else {
      return res.status(400).json({
        msg: "Invalid OTP. Please try again.",
      });
    }
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({
      msg: "Error occurred in OTP verification",
      error: err.message,
    });
  }
});

// Send OTP Route (Demo - normally would integrate with SMS service)
route.post("/send-otp", async (req, res) => {
  try {
    const { patientId } = req.body;
    const incomingPhone = req.body.phone || req.body.phoneNumber || "";

    const normalizePhone = (value = "") => {
      const digits = String(value).replace(/\D/g, "");
      if (digits.startsWith("91") && digits.length === 12) {
        return digits.substring(2);
      }
      return digits;
    };

    const buildPhoneVariants = (value = "") => {
      const local = normalizePhone(value);
      const variants = [
        String(value).trim(),
        local,
        local ? `+91${local}` : "",
        local ? `91${local}` : "",
        local ? `+${local}` : "",
      ].filter(Boolean);
      return [...new Set(variants)];
    };

    let patient;
    if (patientId) {
      patient = await PatientSchemas.findOne({
        $or: [{ MedicalId: patientId }, { _id: patientId }],
      });
    } else if (incomingPhone) {
      const phoneVariants = buildPhoneVariants(incomingPhone);
      patient = await PatientSchemas.findOne({
        Mobile_no: { $in: phoneVariants },
      });
    }

    if (!patient) {
      return res.status(404).json({
        msg: "Patient not found with provided details",
      });
    }

    // For demo purposes, return a mock OTP
    const demoOTP = "1234"; // In production, generate random OTP and send via SMS

    res.json({
      msg: "OTP sent successfully",
      phone: patient.Mobile_no,
      // In production, don't return OTP in response
      demoOTP: demoOTP, // Only for testing
      patientInfo: {
        name: patient.Name,
        medicalId: patient.MedicalId,
      },
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({
      msg: "Error occurred while sending OTP",
      error: err.message,
    });
  }
});

// Update patient details
route.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPatient = await PatientSchemas.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!updatedPatient) {
      return res.status(404).json({
        msg: "Patient not found",
      });
    }

    res.json({
      msg: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (err) {
    console.error("Error updating patient:", err);
    res.status(500).json({
      msg: "Error occurred while updating patient",
      error: err.message,
    });
  }
});

// Delete patient by ID - Enhanced to remove from all portals
route.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // First find the patient to get details
    const patient = await PatientSchemas.findById(id);
    if (!patient) {
      return res.json({
        msg: "Patient not found in database",
      });
    }

    // Delete patient from main collection
    const deletedPatient = await PatientSchemas.findByIdAndDelete(id);

    // Remove patient references from all doctor records
    await DoctorSchema.updateMany(
      { "patients.patientId": id },
      { $pull: { patients: { patientId: id } } },
    );

    // Remove patient references from all admin records
    await AdminSchema.updateMany(
      { managedPatients: id },
      { $pull: { managedPatients: id } },
    );

    if (deletedPatient) {
      res.json({
        msg: "Patient deleted successfully from all portals",
        deletedPatient: {
          name: patient.Name,
          medicalId: patient.MedicalId,
        },
      });
    } else {
      res.json({
        msg: "Patient not found in database",
      });
    }
  } catch (err) {
    console.error("Delete patient error:", err);
    res.json({
      msg: "Error occurred while deleting patient",
      error: err.message,
    });
  }
});

// Add report upload endpoint
route.post(
  "/reportentry",
  verifyToken,
  authorize("doctor", "admin", "scan_center"),
  async (req, res) => {
    try {
      const { _id, reportUrl, reportName, uploadDate, fileHash, encryptionIV } =
        req.body;
      const result = await PatientSchemas.findOneAndUpdate(
        { _id, "History.Date": simpleFormattedDate },
        {
          $push: {
            "History.$.report.files": {
              name: reportName,
              url: reportUrl,
              uploadDate: uploadDate,
              fileHash: fileHash || "",
              encryptionIV: encryptionIV || "",
              encrypted: !!encryptionIV,
            },
          },
        },
      );

      if (result) {
        res.json({
          msg: "Report uploaded successfully",
          encrypted: !!encryptionIV,
          hashed: !!fileHash,
        });
      } else {
        res.json({
          msg: "Report upload failed",
        });
      }
    } catch (err) {
      res.json({
        msg: "Error occurred in Report Upload",
      });
    }
  },
);

// Add medical report endpoint
route.post(
  "/addreport",
  verifyToken,
  authorize("doctor", "admin", "scan_center"),
  async (req, res) => {
    try {
      const { disease, vitals, notes, medicines, Date, patientId } = req.body;
      const result = await PatientSchemas.findByIdAndUpdate(patientId, {
        $push: {
          History: {
            disease: disease,
            notes: notes,
            vitals: vitals,
            Date: Date,
            DoctorDetails: {},
            report: { files: [] },
            preciption: medicines || [],
          },
        },
      });

      if (result) {
        res.json({
          msg: "Medical report added successfully",
        });
      } else {
        res.json({
          msg: "Medical report not saved",
        });
      }
    } catch (err) {
      res.json({
        msg: "Error occurred in Medical Report",
      });
    }
  },
);

// Get patient by phone number (for OTP verification)
route.post("/getbyphone", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Clean phone number formats
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
      cleanPhone = cleanPhone.substring(2);
    }

    // Try multiple phone number formats
    const patient = await PatientSchemas.findOne({
      $or: [
        { Mobile_no: phone },
        { Mobile_no: `+91${cleanPhone}` },
        { Mobile_no: `91${cleanPhone}` },
        { Mobile_no: cleanPhone },
        { Mobile_no: `+${phone}` },
      ],
    });

    if (patient) {
      res.json({
        success: true,
        message: "Patient found",
        patient: {
          _id: patient._id,
          Name: patient.Name,
          Email: patient.Email,
          Mobile_no: patient.Mobile_no,
          Age: patient.Age,
          Gender: patient.Gender,
          MedicalId: patient.MedicalId,
          Address: patient.Address,
          DOB: patient.DOB,
          Aadhar: patient.Aadhar,
          BloodGroup: patient.BloodGroup,
          EmergencyContact: patient.EmergencyContact,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Patient not found with this phone number",
      });
    }
  } catch (error) {
    console.error("Error fetching patient by phone:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Search patient by MedicalId (UHID), Name, Phone, or Email
route.get("/search/:medicalId", async (req, res) => {
  try {
    const { medicalId } = req.params;
    const query = medicalId.trim();

    // If query is a Mongo ObjectId (e.g. linked from /doctor/patient/:id), look up directly
    let patient = null;
    if (/^[0-9a-fA-F]{24}$/.test(query)) {
      patient = await PatientSchemas.findOne({ _id: query });
    }

    // Try exact match on MedicalId first
    if (!patient) {
      patient = await PatientSchemas.findOne({ MedicalId: query });
    }

    // If not found, try case-insensitive regex match on MedicalId
    if (!patient) {
      patient = await PatientSchemas.findOne({
        MedicalId: {
          $regex: new RegExp(
            `^${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i",
          ),
        },
      });
    }

    // If query looks like a number (e.g. "1001", "001", "1"), try common UHID formats
    if (!patient && /^\d+$/.test(query)) {
      const num = parseInt(query, 10);
      // Try MED001, UHID-1001, RAM-1001 etc. formats
      const possibleIds = [
        `MED${String(num).padStart(3, "0")}`,
        `MED${query}`,
        `UHID-${query}`,
        `RAM-${query}`,
      ];
      patient = await PatientSchemas.findOne({
        MedicalId: { $in: possibleIds },
      });
      // Also try any MedicalId ending with the number
      if (!patient) {
        patient = await PatientSchemas.findOne({
          MedicalId: { $regex: new RegExp(`${query}$`, "i") },
        });
      }
    }

    // If still not found, search by Name, Email, or Phone (case-insensitive partial)
    if (!patient) {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      patient = await PatientSchemas.findOne({
        $or: [
          { Name: { $regex: escapedQuery, $options: "i" } },
          { Email: { $regex: escapedQuery, $options: "i" } },
          { Mobile_no: { $regex: escapedQuery, $options: "i" } },
          { MedicalId: { $regex: escapedQuery, $options: "i" } },
        ],
      });
    }

    if (patient) {
      res.status(200).json({
        success: true,
        data: {
          _id: patient._id,
          Name: patient.Name,
          Email: patient.Email,
          Mobile_no: patient.Mobile_no,
          Age: patient.Age,
          Gender: patient.Gender,
          MedicalId: patient.MedicalId,
          Address: patient.Address,
          DOB: patient.DOB,
          Aadhar: patient.Aadhar,
          BloodGroup: patient.BloodGroup,
          EmergencyContact: patient.EmergencyContact,
          EmergencyContactName: patient.EmergencyContactName,
          EmergencyContactNumber: patient.EmergencyContactNumber,
          Allergies: patient.Allergies,
          ChronicConditions: patient.ChronicConditions,
          status: patient.status,
          assignedDoctor: patient.assignedDoctor,
          History: patient.History || [],
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message:
          "Patient not found. Try searching by name, phone, email, or Medical ID.",
      });
    }
  } catch (error) {
    console.error("Error searching patient by Medical ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = route;
