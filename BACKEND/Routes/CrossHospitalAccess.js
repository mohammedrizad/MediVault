const express = require("express");
const route = express.Router();
const AdminScheme = require("../Models/AdminSchema");
const PatientSchemas = require("../Models/PatientsSchema");
const DoctorScheme = require("../Models/DoctorScheme");

// Schema for Cross-Hospital Access Requests
const mongoose = require("mongoose");

const CrossHospitalRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  requestingHospital: { type: String, required: true },
  targetHospital: { type: String, required: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  requestType: { type: String, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "denied"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  requestDate: { type: Date, default: Date.now },
  requestedBy: { type: String, required: true },
  approvedBy: { type: String },
  deniedBy: { type: String },
  approvedDate: { type: Date },
  deniedDate: { type: Date },
  expiryDate: { type: Date },
  accessLog: [
    {
      action: String,
      timestamp: { type: Date, default: Date.now },
      user: String,
      ipAddress: String,
    },
  ],
});

const CrossHospitalRequest = mongoose.model(
  "CrossHospitalRequest",
  CrossHospitalRequestSchema
);

// Get all cross-hospital requests
route.get("/requests", async (req, res) => {
  try {
    const requests = await CrossHospitalRequest.find().sort({
      requestDate: -1,
    });
    res.json({
      success: true,
      requests: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error fetching cross-hospital requests",
      error: error.message,
    });
  }
});

// Create new cross-hospital request
route.post("/requests", async (req, res) => {
  try {
    const {
      requestingHospital,
      targetHospital,
      patientId,
      patientName,
      requestType,
      reason,
      priority,
      requestedBy,
      expiryDays = 7,
    } = req.body;

    // Generate unique request ID
    const requestId = `REQ${Date.now()}`;

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    const newRequest = new CrossHospitalRequest({
      requestId,
      requestingHospital,
      targetHospital,
      patientId,
      patientName,
      requestType,
      reason,
      priority,
      requestedBy,
      expiryDate,
    });

    await newRequest.save();

    res.json({
      success: true,
      msg: "Cross-hospital request created successfully",
      request: newRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error creating cross-hospital request",
      error: error.message,
    });
  }
});

// Update request status (approve/deny)
route.put("/requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, actionBy } = req.body; // action: 'approved' or 'denied'

    const updateData = {
      status: action,
      [`${action}By`]: actionBy,
      [`${action}Date`]: new Date(),
    };

    const updatedRequest = await CrossHospitalRequest.findOneAndUpdate(
      { requestId },
      updateData,
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        msg: "Request not found",
      });
    }

    // Add access log entry
    updatedRequest.accessLog.push({
      action: `request_${action}`,
      user: actionBy,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    await updatedRequest.save();

    res.json({
      success: true,
      msg: `Request ${action} successfully`,
      request: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error updating request",
      error: error.message,
    });
  }
});

// Get cross-hospital patient data
route.get("/patients/search", async (req, res) => {
  try {
    const { hospital, searchTerm, patientId } = req.query;

    let searchQuery = {};

    if (patientId) {
      searchQuery._id = patientId;
    } else if (searchTerm) {
      searchQuery = {
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
          { phoneNumber: { $regex: searchTerm, $options: "i" } },
        ],
      };
    }

    const patients = await PatientSchemas.find(searchQuery).limit(20);

    // Mock cross-hospital data for demo
    const crossHospitalPatients = patients.map((patient) => ({
      ...patient.toObject(),
      currentHospital: hospital || "External Hospital",
      accessStatus: "accessible",
      lastAccessed: new Date(),
      sharedData: {
        basicInfo: true,
        medicalHistory: true,
        currentTreatment: true,
        labResults: false,
        imagingReports: false,
      },
    }));

    res.json({
      success: true,
      patients: crossHospitalPatients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error searching cross-hospital patients",
      error: error.message,
    });
  }
});

// Get access logs for audit
route.get("/audit-logs", async (req, res) => {
  try {
    const requests = await CrossHospitalRequest.find(
      {},
      "accessLog requestId patientName"
    );

    let allLogs = [];
    requests.forEach((request) => {
      request.accessLog.forEach((log) => {
        allLogs.push({
          ...log.toObject(),
          requestId: request.requestId,
          patientName: request.patientName,
        });
      });
    });

    // Sort by timestamp descending
    allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      logs: allLogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error fetching audit logs",
      error: error.message,
    });
  }
});

// Export data endpoints
route.get("/export/requests", async (req, res) => {
  try {
    const { format = "json" } = req.query;
    const requests = await CrossHospitalRequest.find();

    if (format === "csv") {
      const csv = convertToCSV(
        requests.map((req) => ({
          "Request ID": req.requestId,
          "Requesting Hospital": req.requestingHospital,
          "Target Hospital": req.targetHospital,
          "Patient Name": req.patientName,
          "Request Type": req.requestType,
          Status: req.status,
          Priority: req.priority,
          "Request Date": req.requestDate.toLocaleDateString(),
          "Requested By": req.requestedBy,
          Reason: req.reason,
        }))
      );

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=cross-hospital-requests.csv"
      );
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: requests,
        exportDate: new Date(),
        totalRecords: requests.length,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error exporting requests",
      error: error.message,
    });
  }
});

// Helper function to convert to CSV
function convertToCSV(data) {
  if (!data.length) return "";

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(",");
  const csvRows = data.map((row) =>
    headers.map((header) => `"${row[header] || ""}"`).join(",")
  );

  return [csvHeaders, ...csvRows].join("\n");
}

// Statistics endpoint
route.get("/stats", async (req, res) => {
  try {
    const totalRequests = await CrossHospitalRequest.countDocuments();
    const pendingRequests = await CrossHospitalRequest.countDocuments({
      status: "pending",
    });
    const approvedRequests = await CrossHospitalRequest.countDocuments({
      status: "approved",
    });
    const deniedRequests = await CrossHospitalRequest.countDocuments({
      status: "denied",
    });

    res.json({
      success: true,
      stats: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        deniedRequests,
        approvalRate:
          totalRequests > 0
            ? ((approvedRequests / totalRequests) * 100).toFixed(1)
            : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error fetching statistics",
      error: error.message,
    });
  }
});

module.exports = route;
