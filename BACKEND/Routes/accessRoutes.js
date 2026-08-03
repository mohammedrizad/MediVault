const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const AccessRequest = require("../Models/AccessRequest");
const Patient = require("../Models/PatientsSchema");
const Admin = require("../Models/AdminSchema");

// ─── Helper: Auto-expire approved requests past their expiresAt ───
const autoExpireRequests = async () => {
  try {
    await AccessRequest.updateMany(
      { status: "Approved", expiresAt: { $lte: new Date() } },
      { $set: { status: "Expired" } },
    );
  } catch (err) {
    console.error("Auto-expire error:", err.message);
  }
};

// ─── GET /hospitals — List all registered hospitals ───
router.get("/hospitals", async (req, res) => {
  try {
    const hospitals = await Admin.find(
      {},
      "hospitalName email isVerified address phone specialties",
    );
    res.json({ success: true, data: hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /search-patient — Search patients by name, MedicalId (UHID) ───
router.get("/search-patient", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const patients = await Patient.find({
      $or: [
        { Name: { $regex: q, $options: "i" } },
        { MedicalId: { $regex: q, $options: "i" } },
      ],
    }).limit(10);

    // Enrich with hospital name + visit history
    const enriched = await Promise.all(
      patients.map(async (p) => {
        let hospitalName = "MediVault Centre Hospital";
        if (p.AdminID) {
          const admin = await Admin.findById(p.AdminID, "hospitalName");
          if (admin) hospitalName = admin.hospitalName;
        }

        // Build visit history from History array
        const visitHistory = (p.History || []).map((h) => {
          // Extract hospital name from DoctorDetails string like "Dr. X - Dept, Hospital Name"
          let visitHospital = hospitalName;
          const docStr =
            typeof h.DoctorDetails === "string" ? h.DoctorDetails : "";
          const commaIdx = docStr.lastIndexOf(",");
          if (commaIdx > -1) {
            visitHospital =
              docStr.substring(commaIdx + 1).trim() || hospitalName;
          }
          return {
            disease: h.disease || "General Checkup",
            date: h.Date || "N/A",
            doctor:
              typeof h.DoctorDetails === "object"
                ? h.DoctorDetails?.name || "Doctor"
                : h.DoctorDetails || "Doctor",
            hospital: visitHospital,
          };
        });

        return {
          _id: p._id,
          Name: p.Name,
          UHID: p.MedicalId,
          MedicalId: p.MedicalId,
          Age: p.Age,
          Gender: p.Gender,
          BloodGroup: p.BloodGroup,
          Allergies: p.Allergies || "None",
          ChronicConditions: p.ChronicConditions || "None",
          hospitalName,
          visitHistory,
          totalVisits: visitHistory.length,
        };
      }),
    );

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /verify-hospital — Get hospital verification details ───
router.get("/verify-hospital", async (req, res) => {
  try {
    const { hospitalName } = req.query;
    if (!hospitalName) {
      return res
        .status(400)
        .json({ success: false, message: "hospitalName required" });
    }

    const hospital = await Admin.findOne({
      hospitalName: { $regex: hospitalName, $options: "i" },
    });

    if (!hospital) {
      return res.json({
        success: true,
        data: {
          found: false,
          hospitalName,
          isVerified: false,
        },
      });
    }

    res.json({
      success: true,
      data: {
        found: true,
        hospitalName: hospital.hospitalName,
        ownerName: hospital.ownerName,
        email: hospital.email,
        phone: hospital.phone,
        address: hospital.address,
        specialties: hospital.specialties,
        isVerified: hospital.isVerified || false,
        numberOfBeds: hospital.numberOfBeds,
        timings: hospital.timings,
        registrationId: hospital._id.toString().slice(-8).toUpperCase(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /requests — All access requests filtered by hospital ───
router.get("/requests", async (req, res) => {
  try {
    await autoExpireRequests();
    const { hospitalName } = req.query;

    let query = {};
    if (hospitalName) {
      query = {
        $or: [
          { patientHospital: hospitalName },
          { requestingHospital: hospitalName },
        ],
      };
    }

    const requests = await AccessRequest.find(query).sort({ requestDate: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /request — Create a new access request ───
router.post("/request", async (req, res) => {
  try {
    const {
      requestingHospital,
      requestingHospitalId,
      requestingDoctor,
      patientId,
      reason,
      urgency,
      dataCategories,
      requesterEmail,
    } = req.body;

    // Verify the requesting hospital is verified
    if (requesterEmail) {
      const admin = await Admin.findOne({ email: requesterEmail });
      if (!admin || !admin.isVerified) {
        return res.status(403).json({
          success: false,
          message:
            "Access Denied: Your hospital must be verified before requesting cross-hospital access. Contact MediVault administration.",
        });
      }
    }

    // Find patient
    let patientQuery;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patientQuery = { $or: [{ MedicalId: patientId }, { _id: patientId }] };
    } else {
      patientQuery = { MedicalId: patientId };
    }
    const patient = await Patient.findOne(patientQuery);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found. Please verify the Medical ID.",
      });
    }

    // Determine which hospital owns this patient
    let patientHospital = "MediVault Hospital";
    let patientHospitalId = null;
    if (patient.AdminID) {
      const patientAdmin = await Admin.findById(patient.AdminID);
      if (patientAdmin) {
        patientHospital = patientAdmin.hospitalName;
        patientHospitalId = patientAdmin._id.toString();
      }
    }

    // Prevent requesting access to own hospital's patients
    if (requestingHospital === patientHospital) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot request access to patients from your own hospital. This patient is already under your hospital.",
      });
    }

    // Check for duplicate pending request
    const existingPending = await AccessRequest.findOne({
      requestingHospital,
      patientId: patient.MedicalId || patient._id,
      status: "Pending",
    });
    if (existingPending) {
      return res.status(409).json({
        success: false,
        message:
          "A pending request already exists for this patient. Please wait for the response.",
      });
    }

    const newRequest = new AccessRequest({
      requestingHospital,
      requestingHospitalId: requestingHospitalId || null,
      requestingDoctor,
      patientId: patient.MedicalId || patient._id,
      patientName: patient.Name,
      patientHospital,
      patientHospitalId,
      reason,
      urgency: urgency || "Normal",
      dataCategories: dataCategories || ["Basic Info", "Medical History"],
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: "Access request submitted successfully. Awaiting approval.",
      data: newRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /request/:id — Approve or Reject a request ───
router.put("/request/:id", async (req, res) => {
  try {
    const { status, approvedBy, rejectionReason, accessDurationHours } =
      req.body;
    const request = await AccessRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot update a request with status "${request.status}". Only pending requests can be approved or rejected.`,
      });
    }

    request.status = status;

    if (status === "Approved") {
      request.approvalDate = Date.now();
      request.approvedBy = approvedBy || "Admin";
      // Default access duration: 72 hours (3 days)
      const durationHours = accessDurationHours || 72;
      request.expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    } else if (status === "Rejected") {
      request.rejectionReason = rejectionReason || "Request denied by admin";
    }

    await request.save();

    res.json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /patient-data/:requestId — Get patient data for an approved request ───
router.get("/patient-data/:requestId", async (req, res) => {
  try {
    await autoExpireRequests();
    const request = await AccessRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Access request not found",
      });
    }

    if (request.status !== "Approved") {
      return res.status(403).json({
        success: false,
        message: `Cannot access patient data. Request status: ${request.status}`,
      });
    }

    // Check if access has expired
    if (request.expiresAt && new Date() > request.expiresAt) {
      request.status = "Expired";
      await request.save();
      return res.status(403).json({
        success: false,
        message: "Access has expired. Please submit a new request.",
      });
    }

    // Find patient
    const patient = await Patient.findOne({
      $or: [
        { MedicalId: request.patientId },
        ...(mongoose.Types.ObjectId.isValid(request.patientId)
          ? [{ _id: request.patientId }]
          : []),
      ],
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient record not found",
      });
    }

    // Track access
    request.accessCount = (request.accessCount || 0) + 1;
    request.lastAccessedAt = new Date();
    await request.save();

    // Build response based on requested data categories
    const categories = request.dataCategories || [
      "Basic Info",
      "Medical History",
    ];
    const responseData = {};

    if (categories.includes("Basic Info")) {
      responseData.basicInfo = {
        Name: patient.Name,
        MedicalId: patient.MedicalId,
        Age: patient.Age,
        Gender: patient.Gender,
        DOB: patient.DOB,
        BloodGroup: patient.BloodGroup,
      };
    }

    if (categories.includes("Medical History")) {
      responseData.medicalHistory = {
        ChronicConditions: patient.ChronicConditions,
        Allergies: patient.Allergies,
        History: (patient.History || []).map((h) => ({
          disease: h.disease,
          notes: h.notes,
          Date: h.Date,
          DoctorDetails: h.DoctorDetails,
          vitals: h.vitals,
          preciption: h.preciption,
        })),
      };
    }

    if (categories.includes("Emergency Info")) {
      responseData.emergencyInfo = {
        EmergencyContactName: patient.EmergencyContactName,
        EmergencyContactNumber: patient.EmergencyContactNumber,
        BloodGroup: patient.BloodGroup,
        Allergies: patient.Allergies,
      };
    }

    if (categories.includes("Vitals")) {
      responseData.vitals = (patient.History || [])
        .filter((h) => h.vitals && Object.keys(h.vitals).length > 0)
        .map((h) => ({
          Date: h.Date,
          vitals: h.vitals,
        }));
    }

    if (categories.includes("Prescriptions")) {
      responseData.prescriptions = (patient.History || [])
        .filter((h) => h.preciption && h.preciption.length > 0)
        .map((h) => ({
          Date: h.Date,
          disease: h.disease,
          prescriptions: h.preciption,
        }));
    }

    if (categories.includes("Blood Tests / Lab Reports")) {
      responseData.bloodTests = (patient.History || [])
        .filter((h) => h.bloodTests && h.bloodTests.length > 0)
        .map((h) => ({
          Date: h.Date,
          disease: h.disease,
          doctor:
            typeof h.DoctorDetails === "object"
              ? h.DoctorDetails?.name || "Doctor"
              : h.DoctorDetails || "Doctor",
          bloodTests: h.bloodTests,
        }));
    }

    if (categories.includes("Current Medications")) {
      // Gather all active/recent prescriptions as current medications
      const allMeds = [];
      (patient.History || []).forEach((h) => {
        if (h.preciption && h.preciption.length > 0) {
          h.preciption.forEach((rx) => {
            allMeds.push({
              medicine: rx.medicine || rx,
              dosage: rx.dosage || "",
              duration: rx.duration || "",
              prescribedFor: h.disease || "General",
              prescribedDate: h.Date || "N/A",
              doctor:
                typeof h.DoctorDetails === "object"
                  ? h.DoctorDetails?.name || "Doctor"
                  : h.DoctorDetails || "Doctor",
            });
          });
        }
      });
      responseData.currentMedications = allMeds;
    }

    if (categories.includes("Surgical History")) {
      responseData.surgicalHistory = (patient.History || [])
        .filter((h) => h.surgicalHistory && h.surgicalHistory.length > 0)
        .map((h) => ({
          Date: h.Date,
          disease: h.disease,
          surgeries: h.surgicalHistory,
        }));
    }

    res.json({
      success: true,
      data: {
        patient: responseData,
        accessInfo: {
          requestId: request._id,
          requestingHospital: request.requestingHospital,
          approvedBy: request.approvedBy,
          approvalDate: request.approvalDate,
          expiresAt: request.expiresAt,
          accessCount: request.accessCount,
          dataCategories: request.dataCategories,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /shared-patient/:id — Legacy: Get shared patient by patientId ───
router.get("/shared-patient/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const request = await AccessRequest.findOne({
      patientId: id,
      status: "Approved",
    });

    if (!request) {
      return res.status(403).json({
        success: false,
        message: "No approved access request found for this patient",
      });
    }

    const patient = await Patient.findOne({
      $or: [{ MedicalId: id }, { _id: id }],
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /request/:id/revoke — Revoke an approved request ───
router.put("/request/:id/revoke", async (req, res) => {
  try {
    const { revokedBy, revokeReason } = req.body;
    const request = await AccessRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Access request not found",
      });
    }

    if (request.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: `Cannot revoke a request with status "${request.status}". Only approved requests can be revoked.`,
      });
    }

    request.status = "Revoked";
    request.revokedAt = Date.now();
    request.revokedBy = revokedBy || "Admin";
    request.revokeReason = revokeReason || "Access revoked by admin";

    await request.save();

    res.json({
      success: true,
      message: "Access revoked successfully",
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /patient-access — Access history for a specific patient ───
router.get("/patient-access", async (req, res) => {
  try {
    const { patientId, patientName } = req.query;

    if (!patientId && !patientName) {
      return res.status(400).json({
        success: false,
        message: "patientId or patientName is required",
      });
    }

    let query = {};
    if (patientId) {
      query.patientId = patientId;
    } else if (patientName) {
      query.patientName = { $regex: patientName, $options: "i" };
    }

    const requests = await AccessRequest.find(query).sort({ requestDate: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /stats — Dashboard statistics ───
router.get("/stats", async (req, res) => {
  try {
    await autoExpireRequests();
    const { hospitalName } = req.query;

    let matchFilter = {};
    if (hospitalName) {
      matchFilter = {
        $or: [
          { patientHospital: hospitalName },
          { requestingHospital: hospitalName },
        ],
      };
    }

    const allRequests = await AccessRequest.find(matchFilter);

    const stats = {
      totalRequests: allRequests.length,
      pending: allRequests.filter((r) => r.status === "Pending").length,
      approved: allRequests.filter((r) => r.status === "Approved").length,
      rejected: allRequests.filter((r) => r.status === "Rejected").length,
      revoked: allRequests.filter((r) => r.status === "Revoked").length,
      expired: allRequests.filter((r) => r.status === "Expired").length,
      incomingPending: hospitalName
        ? allRequests.filter(
            (r) => r.status === "Pending" && r.patientHospital === hospitalName,
          ).length
        : 0,
      outgoingPending: hospitalName
        ? allRequests.filter(
            (r) =>
              r.status === "Pending" && r.requestingHospital === hospitalName,
          ).length
        : 0,
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /shared-patients — All shared patients for a hospital ───
router.get("/shared-patients", async (req, res) => {
  try {
    await autoExpireRequests();
    const { hospital } = req.query;

    if (!hospital) {
      return res
        .status(400)
        .json({ success: false, message: "Hospital name is required" });
    }

    const approvedRequests = await AccessRequest.find({
      requestingHospital: hospital,
      status: "Approved",
    });

    const patientIds = approvedRequests.map((r) => r.patientId);

    const validObjectIds = patientIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id),
    );

    const patients = await Patient.find({
      $or: [
        { MedicalId: { $in: patientIds } },
        ...(validObjectIds.length > 0
          ? [{ _id: { $in: validObjectIds } }]
          : []),
      ],
    });

    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /seed-demo — Seed demo patients with UHID + history ───
router.post("/seed-demo", async (req, res) => {
  try {
    // Check if mock patients already exist
    const existing = await Patient.findOne({ MedicalId: "UHID-1001" });
    if (existing) {
      return res.json({
        success: true,
        message: "Mock patients with UHID already exist. Skipping seed.",
        data: { seeded: false },
      });
    }

    const mockPatients = [
      {
        Name: "Rahul Sharma",
        MedicalId: "UHID-1001",
        Address: "45 MG Road, Chennai",
        Mobile_no: "9876543210",
        DOB: "1985-03-15",
        Age: "40",
        Gender: "Male",
        Email: "rahul.sharma@email.com",
        BloodGroup: "B+",
        EmergencyContactName: "Priya Sharma",
        EmergencyContactNumber: "9876543211",
        Allergies: "Penicillin, Dust",
        ChronicConditions: "Type 2 Diabetes, Hypertension",
        status: "Active",
        assignedDoctor: "Dr. Anand Kumar",
        History: [
          {
            disease: "Type 2 Diabetes Monitoring",
            notes:
              "HbA1c at 7.2%, prescribed Metformin 500mg. Diet counseling provided. Blood sugar fasting: 142 mg/dL",
            Date: "2025-11-15",
            DoctorDetails:
              "Dr. Anand Kumar - Endocrinology, MediVault Centre Hospital",
            vitals: {
              bp: "138/88",
              pulse: "78",
              temp: "98.4",
              weight: "82kg",
              spo2: "97%",
            },
            preciption: [
              {
                medicine: "Metformin",
                dosage: "500mg",
                duration: "Twice daily for 3 months",
              },
              {
                medicine: "Glimepiride",
                dosage: "1mg",
                duration: "Once daily before breakfast",
              },
            ],
            bloodTests: [
              {
                testName: "HbA1c",
                value: "7.2",
                unit: "%",
                normalRange: "< 5.7",
                status: "HIGH",
              },
              {
                testName: "Fasting Blood Sugar",
                value: "142",
                unit: "mg/dL",
                normalRange: "70-100",
                status: "HIGH",
              },
              {
                testName: "Post Prandial Sugar",
                value: "210",
                unit: "mg/dL",
                normalRange: "< 140",
                status: "HIGH",
              },
              {
                testName: "Serum Creatinine",
                value: "0.9",
                unit: "mg/dL",
                normalRange: "0.7-1.3",
                status: "NORMAL",
              },
              {
                testName: "Total Cholesterol",
                value: "195",
                unit: "mg/dL",
                normalRange: "< 200",
                status: "NORMAL",
              },
            ],
          },
          {
            disease: "Hypertension Follow-up",
            notes:
              "BP elevated. Adjusted medication. ECG normal. Advised low-sodium diet and 30min daily walking",
            Date: "2025-09-20",
            DoctorDetails:
              "Dr. Meena Iyer - Cardiology, MediVault Centre Hospital",
            vitals: {
              bp: "148/92",
              pulse: "82",
              temp: "98.6",
              weight: "84kg",
              spo2: "98%",
            },
            preciption: [
              { medicine: "Amlodipine", dosage: "5mg", duration: "Once daily" },
              {
                medicine: "Telmisartan",
                dosage: "40mg",
                duration: "Once daily",
              },
            ],
            bloodTests: [
              {
                testName: "Complete Blood Count (CBC)",
                value: "Normal",
                unit: "",
                normalRange: "",
                status: "NORMAL",
              },
              {
                testName: "Serum Potassium",
                value: "4.1",
                unit: "mEq/L",
                normalRange: "3.5-5.0",
                status: "NORMAL",
              },
              {
                testName: "Serum Sodium",
                value: "139",
                unit: "mEq/L",
                normalRange: "136-145",
                status: "NORMAL",
              },
              {
                testName: "BUN",
                value: "18",
                unit: "mg/dL",
                normalRange: "7-20",
                status: "NORMAL",
              },
            ],
          },
          {
            disease: "Seasonal Flu",
            notes:
              "Upper respiratory infection. Mild fever for 3 days. Throat congestion. RT-PCR negative for COVID",
            Date: "2025-06-10",
            DoctorDetails:
              "Dr. Suresh Menon - General Medicine, MediVault Centre Hospital",
            vitals: {
              bp: "130/85",
              pulse: "88",
              temp: "100.2",
              weight: "83kg",
              spo2: "96%",
            },
            preciption: [
              {
                medicine: "Paracetamol",
                dosage: "650mg",
                duration: "Thrice daily for 5 days",
              },
              {
                medicine: "Cetirizine",
                dosage: "10mg",
                duration: "Once daily for 7 days",
              },
              {
                medicine: "Amoxicillin",
                dosage: "500mg",
                duration: "Thrice daily for 5 days",
              },
            ],
            bloodTests: [
              {
                testName: "WBC Count",
                value: "12500",
                unit: "/mcL",
                normalRange: "4500-11000",
                status: "HIGH",
              },
              {
                testName: "CRP (C-Reactive Protein)",
                value: "8.5",
                unit: "mg/L",
                normalRange: "< 3.0",
                status: "HIGH",
              },
            ],
          },
        ],
      },
      {
        Name: "Ananya Krishnan",
        MedicalId: "UHID-1002",
        Address: "12 Anna Nagar, Chennai",
        Mobile_no: "9876543220",
        DOB: "1992-07-22",
        Age: "33",
        Gender: "Female",
        Email: "ananya.k@email.com",
        BloodGroup: "O+",
        EmergencyContactName: "Vijay Krishnan",
        EmergencyContactNumber: "9876543221",
        Allergies: "Sulfa drugs",
        ChronicConditions: "Asthma (mild persistent)",
        status: "Active",
        assignedDoctor: "Dr. Lakshmi Nair",
        History: [
          {
            disease: "Asthma Exacerbation",
            notes:
              "Acute wheeze episode triggered by pollution. Peak flow 65%. Nebulization given. Improved to 85% post-treatment",
            Date: "2025-12-01",
            DoctorDetails:
              "Dr. Lakshmi Nair - Pulmonology, MediVault Centre Hospital",
            vitals: {
              bp: "118/72",
              pulse: "96",
              temp: "98.4",
              weight: "58kg",
              spo2: "92%",
            },
            preciption: [
              {
                medicine: "Salbutamol Inhaler",
                dosage: "100mcg",
                duration: "2 puffs as needed",
              },
              {
                medicine: "Budesonide Inhaler",
                dosage: "200mcg",
                duration: "Twice daily for 4 weeks",
              },
              {
                medicine: "Montelukast",
                dosage: "10mg",
                duration: "Once daily at bedtime",
              },
            ],
            bloodTests: [
              {
                testName: "IgE Total",
                value: "450",
                unit: "IU/mL",
                normalRange: "< 100",
                status: "HIGH",
              },
              {
                testName: "Eosinophil Count",
                value: "8",
                unit: "%",
                normalRange: "1-4",
                status: "HIGH",
              },
            ],
          },
          {
            disease: "Annual Health Checkup",
            notes:
              "All vitals normal. CBC, LFT, KFT within normal limits. Thyroid TSH slightly elevated at 5.8. Advise repeat in 6 weeks",
            Date: "2025-08-15",
            DoctorDetails:
              "Dr. Suresh Menon - General Medicine, MediVault Centre Hospital",
            vitals: {
              bp: "110/70",
              pulse: "72",
              temp: "98.2",
              weight: "57kg",
              spo2: "99%",
            },
            preciption: [],
            bloodTests: [
              {
                testName: "Hemoglobin",
                value: "12.8",
                unit: "g/dL",
                normalRange: "12.0-16.0",
                status: "NORMAL",
              },
              {
                testName: "WBC Count",
                value: "7200",
                unit: "/mcL",
                normalRange: "4500-11000",
                status: "NORMAL",
              },
              {
                testName: "Platelet Count",
                value: "250000",
                unit: "/mcL",
                normalRange: "150000-400000",
                status: "NORMAL",
              },
              {
                testName: "TSH",
                value: "5.8",
                unit: "mIU/L",
                normalRange: "0.4-4.0",
                status: "HIGH",
              },
              {
                testName: "SGPT (ALT)",
                value: "28",
                unit: "U/L",
                normalRange: "7-56",
                status: "NORMAL",
              },
              {
                testName: "SGOT (AST)",
                value: "24",
                unit: "U/L",
                normalRange: "10-40",
                status: "NORMAL",
              },
              {
                testName: "Serum Creatinine",
                value: "0.8",
                unit: "mg/dL",
                normalRange: "0.6-1.2",
                status: "NORMAL",
              },
              {
                testName: "Blood Urea",
                value: "25",
                unit: "mg/dL",
                normalRange: "15-40",
                status: "NORMAL",
              },
            ],
          },
        ],
      },
      {
        Name: "Mohammed Farhan",
        MedicalId: "UHID-1003",
        Address: "78 T Nagar, Chennai",
        Mobile_no: "9876543230",
        DOB: "1978-11-05",
        Age: "47",
        Gender: "Male",
        Email: "farhan.m@email.com",
        BloodGroup: "A-",
        EmergencyContactName: "Fatima Farhan",
        EmergencyContactNumber: "9876543231",
        Allergies: "Aspirin, Iodine contrast",
        ChronicConditions: "Coronary Artery Disease, Hyperlipidemia",
        status: "Active",
        assignedDoctor: "Dr. Meena Iyer",
        History: [
          {
            disease: "Post-Angioplasty Follow-up",
            notes:
              "Stent placed in LAD 3 months ago. Doing well. Treadmill test positive at 9 minutes. Continue dual antiplatelet therapy",
            Date: "2025-10-25",
            DoctorDetails:
              "Dr. Meena Iyer - Cardiology, MediVault Centre Hospital",
            vitals: {
              bp: "128/78",
              pulse: "68",
              temp: "98.4",
              weight: "76kg",
              spo2: "98%",
            },
            preciption: [
              {
                medicine: "Aspirin (enteric coated)",
                dosage: "75mg",
                duration: "Once daily lifelong",
              },
              {
                medicine: "Clopidogrel",
                dosage: "75mg",
                duration: "Once daily for 12 months",
              },
              {
                medicine: "Atorvastatin",
                dosage: "40mg",
                duration: "Once daily at bedtime",
              },
              {
                medicine: "Metoprolol",
                dosage: "25mg",
                duration: "Twice daily",
              },
            ],
            bloodTests: [
              {
                testName: "Troponin I",
                value: "0.02",
                unit: "ng/mL",
                normalRange: "< 0.04",
                status: "NORMAL",
              },
              {
                testName: "LDL Cholesterol",
                value: "110",
                unit: "mg/dL",
                normalRange: "< 100",
                status: "HIGH",
              },
              {
                testName: "HDL Cholesterol",
                value: "42",
                unit: "mg/dL",
                normalRange: "> 40",
                status: "NORMAL",
              },
              {
                testName: "Triglycerides",
                value: "165",
                unit: "mg/dL",
                normalRange: "< 150",
                status: "HIGH",
              },
              {
                testName: "PT/INR",
                value: "1.1",
                unit: "",
                normalRange: "0.8-1.2",
                status: "NORMAL",
              },
            ],
            surgicalHistory: [
              {
                procedure: "Coronary Angioplasty with Stent (LAD)",
                date: "2025-07-20",
                hospital: "MediVault Centre Hospital",
                surgeon: "Dr. Rajiv Menon",
                outcome: "Successful",
              },
            ],
          },
          {
            disease: "Chest Pain - Acute Coronary Syndrome",
            notes:
              "Presented with crushing chest pain radiating to left arm. Troponin elevated. Emergency angioplasty performed. Stent deployed to LAD",
            Date: "2025-07-20",
            DoctorDetails:
              "Dr. Rajiv Menon - Interventional Cardiology, MediVault Centre Hospital",
            vitals: {
              bp: "160/100",
              pulse: "110",
              temp: "98.8",
              weight: "78kg",
              spo2: "94%",
            },
            preciption: [
              {
                medicine: "Nitroglycerin",
                dosage: "0.4mg",
                duration: "Sublingual PRN",
              },
              {
                medicine: "Heparin Infusion",
                dosage: "1000 units/hr",
                duration: "48 hours",
              },
              {
                medicine: "Morphine",
                dosage: "2mg IV",
                duration: "PRN for pain",
              },
            ],
            bloodTests: [
              {
                testName: "Troponin I",
                value: "4.8",
                unit: "ng/mL",
                normalRange: "< 0.04",
                status: "CRITICAL",
              },
              {
                testName: "CK-MB",
                value: "85",
                unit: "U/L",
                normalRange: "5-25",
                status: "CRITICAL",
              },
              {
                testName: "BNP",
                value: "620",
                unit: "pg/mL",
                normalRange: "< 100",
                status: "HIGH",
              },
              {
                testName: "D-Dimer",
                value: "0.8",
                unit: "mg/L",
                normalRange: "< 0.5",
                status: "HIGH",
              },
            ],
            surgicalHistory: [
              {
                procedure: "Emergency Coronary Angioplasty - Stent to LAD",
                date: "2025-07-20",
                hospital: "MediVault Centre Hospital",
                surgeon: "Dr. Rajiv Menon",
                outcome: "Successful - Drug eluting stent deployed",
              },
            ],
          },
          {
            disease: "Hyperlipidemia Screening",
            notes:
              "Total cholesterol 280, LDL 185, HDL 38, Triglycerides 220. Started on statin therapy. Lifestyle modification counseling",
            Date: "2025-04-10",
            DoctorDetails:
              "Dr. Anand Kumar - Internal Medicine, MediVault Centre Hospital",
            vitals: {
              bp: "140/90",
              pulse: "76",
              temp: "98.6",
              weight: "80kg",
              spo2: "97%",
            },
            preciption: [
              {
                medicine: "Rosuvastatin",
                dosage: "20mg",
                duration: "Once daily",
              },
              {
                medicine: "Fenofibrate",
                dosage: "145mg",
                duration: "Once daily",
              },
            ],
            bloodTests: [
              {
                testName: "Total Cholesterol",
                value: "280",
                unit: "mg/dL",
                normalRange: "< 200",
                status: "HIGH",
              },
              {
                testName: "LDL Cholesterol",
                value: "185",
                unit: "mg/dL",
                normalRange: "< 100",
                status: "HIGH",
              },
              {
                testName: "HDL Cholesterol",
                value: "38",
                unit: "mg/dL",
                normalRange: "> 40",
                status: "LOW",
              },
              {
                testName: "Triglycerides",
                value: "220",
                unit: "mg/dL",
                normalRange: "< 150",
                status: "HIGH",
              },
              {
                testName: "VLDL",
                value: "44",
                unit: "mg/dL",
                normalRange: "< 30",
                status: "HIGH",
              },
            ],
          },
        ],
      },
      {
        Name: "Deepika Rajan",
        MedicalId: "UHID-1004",
        Address: "23 Adyar, Chennai",
        Mobile_no: "9876543240",
        DOB: "1995-01-30",
        Age: "31",
        Gender: "Female",
        Email: "deepika.r@email.com",
        BloodGroup: "AB+",
        EmergencyContactName: "Rajan Kumar",
        EmergencyContactNumber: "9876543241",
        Allergies: "None known",
        ChronicConditions: "Migraine (chronic)",
        status: "Active",
        assignedDoctor: "Dr. Priya Verma",
        History: [
          {
            disease: "Chronic Migraine Management",
            notes:
              "Frequency increased to 12 days/month. Started prophylactic therapy. MRI Brain normal. Trigger diary reviewed - stress, lack of sleep identified",
            Date: "2025-11-28",
            DoctorDetails:
              "Dr. Priya Verma - Neurology, MediVault Centre Hospital",
            vitals: {
              bp: "108/68",
              pulse: "74",
              temp: "98.2",
              weight: "55kg",
              spo2: "99%",
            },
            preciption: [
              {
                medicine: "Topiramate",
                dosage: "25mg",
                duration: "Once daily, titrate to 50mg",
              },
              {
                medicine: "Sumatriptan",
                dosage: "50mg",
                duration: "PRN for acute attack",
              },
              {
                medicine: "Amitriptyline",
                dosage: "10mg",
                duration: "Once daily at bedtime",
              },
            ],
          },
          {
            disease: "Iron Deficiency Anemia",
            notes:
              "Hb 9.2 g/dL. Serum ferritin 8 ng/mL. Heavy menstrual bleeding reported. Referred to gynecology. Iron supplementation started",
            Date: "2025-08-05",
            DoctorDetails:
              "Dr. Suresh Menon - General Medicine, MediVault Centre Hospital",
            vitals: {
              bp: "100/65",
              pulse: "92",
              temp: "98.0",
              weight: "54kg",
              spo2: "98%",
            },
            preciption: [
              {
                medicine: "Ferrous Sulfate",
                dosage: "325mg",
                duration: "Once daily with Vitamin C",
              },
              {
                medicine: "Folic Acid",
                dosage: "5mg",
                duration: "Once daily for 3 months",
              },
            ],
            bloodTests: [
              {
                testName: "Hemoglobin",
                value: "9.2",
                unit: "g/dL",
                normalRange: "12.0-16.0",
                status: "LOW",
              },
              {
                testName: "Serum Ferritin",
                value: "8",
                unit: "ng/mL",
                normalRange: "12-150",
                status: "LOW",
              },
              {
                testName: "Serum Iron",
                value: "35",
                unit: "mcg/dL",
                normalRange: "60-170",
                status: "LOW",
              },
              {
                testName: "TIBC",
                value: "450",
                unit: "mcg/dL",
                normalRange: "250-370",
                status: "HIGH",
              },
              {
                testName: "MCV",
                value: "68",
                unit: "fL",
                normalRange: "80-100",
                status: "LOW",
              },
              {
                testName: "RBC Count",
                value: "3.8",
                unit: "million/mcL",
                normalRange: "4.0-5.5",
                status: "LOW",
              },
            ],
          },
        ],
      },
      {
        Name: "Arjun Venkatesh",
        MedicalId: "UHID-1005",
        Address: "56 Velachery, Chennai",
        Mobile_no: "9876543250",
        DOB: "1960-09-12",
        Age: "65",
        Gender: "Male",
        Email: "arjun.v@email.com",
        BloodGroup: "O-",
        EmergencyContactName: "Lakshmi Venkatesh",
        EmergencyContactNumber: "9876543251",
        Allergies: "Codeine, Shellfish",
        ChronicConditions: "COPD, Osteoarthritis (bilateral knee)",
        status: "Active",
        assignedDoctor: "Dr. Lakshmi Nair",
        History: [
          {
            disease: "COPD Exacerbation",
            notes:
              "Acute worsening dyspnea. SpO2 dropped to 88%. Nebulization x3, IV steroids started. Sputum culture sent. Chest X-ray shows hyperinflation, no consolidation",
            Date: "2025-12-10",
            DoctorDetails:
              "Dr. Lakshmi Nair - Pulmonology, MediVault Centre Hospital",
            vitals: {
              bp: "145/85",
              pulse: "98",
              temp: "99.8",
              weight: "70kg",
              spo2: "88%",
            },
            preciption: [
              {
                medicine: "Ipratropium Nebulization",
                dosage: "500mcg",
                duration: "Thrice daily for 7 days",
              },
              {
                medicine: "Prednisolone",
                dosage: "40mg",
                duration: "Once daily for 5 days taper",
              },
              {
                medicine: "Azithromycin",
                dosage: "500mg",
                duration: "Once daily for 5 days",
              },
              {
                medicine: "Tiotropium Inhaler",
                dosage: "18mcg",
                duration: "Once daily long-term",
              },
            ],
            bloodTests: [
              {
                testName: "WBC Count",
                value: "14200",
                unit: "/mcL",
                normalRange: "4500-11000",
                status: "HIGH",
              },
              {
                testName: "CRP",
                value: "24",
                unit: "mg/L",
                normalRange: "< 3.0",
                status: "HIGH",
              },
              {
                testName: "Procalcitonin",
                value: "0.8",
                unit: "ng/mL",
                normalRange: "< 0.1",
                status: "HIGH",
              },
              {
                testName: "ABG - pO2",
                value: "62",
                unit: "mmHg",
                normalRange: "80-100",
                status: "LOW",
              },
              {
                testName: "ABG - pCO2",
                value: "52",
                unit: "mmHg",
                normalRange: "35-45",
                status: "HIGH",
              },
            ],
          },
          {
            disease: "Bilateral Knee Pain",
            notes:
              "X-ray shows Grade 3 OA both knees. Viscosupplementation injection given right knee. Physiotherapy referral. Weight reduction counseling",
            Date: "2025-09-18",
            DoctorDetails:
              "Dr. Karthik Raman - Orthopedics, MediVault Centre Hospital",
            vitals: {
              bp: "138/82",
              pulse: "72",
              temp: "98.4",
              weight: "72kg",
              spo2: "95%",
            },
            preciption: [
              {
                medicine: "Etoricoxib",
                dosage: "60mg",
                duration: "Once daily for 2 weeks",
              },
              {
                medicine: "Glucosamine",
                dosage: "1500mg",
                duration: "Once daily for 6 months",
              },
              {
                medicine: "Capsaicin Cream",
                dosage: "0.025%",
                duration: "Apply twice daily",
              },
            ],
          },
          {
            disease: "Annual Pulmonary Function Test",
            notes:
              "FEV1 52% predicted. FEV1/FVC ratio 0.58. Moderate obstruction. Bronchodilator reversibility test negative. Maintain current inhalers",
            Date: "2025-05-22",
            DoctorDetails:
              "Dr. Lakshmi Nair - Pulmonology, MediVault Centre Hospital",
            vitals: {
              bp: "132/80",
              pulse: "76",
              temp: "98.4",
              weight: "71kg",
              spo2: "93%",
            },
            preciption: [
              {
                medicine: "Formoterol+Budesonide Inhaler",
                dosage: "200/6mcg",
                duration: "Twice daily",
              },
              {
                medicine: "Salbutamol Inhaler",
                dosage: "100mcg",
                duration: "PRN rescue",
              },
            ],
          },
        ],
      },
    ];

    await Patient.insertMany(mockPatients);

    res.json({
      success: true,
      message: `Seeded ${mockPatients.length} mock patients with UHID and visit history`,
      data: {
        seeded: true,
        patients: mockPatients.map((p) => ({
          UHID: p.MedicalId,
          Name: p.Name,
          visits: p.History.length,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
