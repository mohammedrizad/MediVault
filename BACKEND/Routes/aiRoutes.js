const express = require("express");
const router = express.Router();
const aiService = require("../Services/aiService");
const Patient = require("../Models/PatientsSchema");
const { GoogleGenAI } = require("@google/genai");

router.post("/analyze-image", async (req, res) => {
  console.log("Received /analyze-image request");
  try {
    const { image } = req.body;
    if (!image) {
      console.error("No image data in request body");
      return res.status(400).json({
        msg: "No image data",
        summary: "No image provided",
        findings: [],
        recommendations: ["Please upload an image"],
        confidence: 0,
        severity: "Unknown",
      });
    }
    console.log("Image data length:", image.length);

    let mimeType = "image/png"; // Default
    if (image.includes("data:") && image.includes(";base64,")) {
      mimeType = image.split(";base64,")[0].split(":")[1];
    }
    console.log("Detected MimeType:", mimeType);

    const base64Data = image.includes("base64,")
      ? image.split("base64,")[1]
      : image;

    console.log("Calling aiService.analyzeImage...");
    const analysisResult = await aiService.analyzeImage(base64Data, mimeType);
    console.log("Analysis successful:", analysisResult);

    res.json(analysisResult);
  } catch (err) {
    console.error("Image Analysis Error:", err);
    res.status(500).json({
      summary: "Server error during analysis",
      findings: ["Error: " + err.message],
      recommendations: ["Retry", "Contact support"],
      confidence: 0,
      severity: "Unknown",
    });
  }
});

router.post("/search-records", async (req, res) => {
  try {
    const { patientId, query } = req.body;
    const patient = await Patient.findById(patientId);

    if (!patient) return res.status(404).json({ msg: "Patient not found" });

    const records = patient.History || [];
    const result = await aiService.searchPatientRecords(records, query);

    res.json(result);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).send("Search Error");
  }
});

router.post("/simplify-report", async (req, res) => {
  try {
    const { text } = req.body;
    const simpleText = await aiService.simplifyReport(text);
    res.json({ text: simpleText });
  } catch (err) {
    console.error("Simplify Error:", err);
    res.status(500).send("Simplify Error");
  }
});

router.post("/health-insights", async (req, res) => {
  try {
    const { patientId } = req.body;
    const patient = await Patient.findById(patientId).lean();

    if (!patient) return res.status(404).json({ msg: "Patient not found" });

    const records = patient.History || [];
    const fullProfile = { ...patient, records };

    const insights = await aiService.generateHealthInsights(fullProfile);
    res.json(insights);
  } catch (err) {
    console.error("Insights Error:", err);
    res.status(500).send("Insights Error");
  }
});

router.post("/check-drugs", async (req, res) => {
  try {
    const { patientId, drugName, currentMedications } = req.body;

    if (!drugName) {
      return res.status(400).json({
        safetyStatus: "Caution",
        severity: "Moderate",
        alerts: ["Drug name is required"],
        recommendations: [],
        interactions: [],
      });
    }

    let patientData = {};

    if (patientId && patientId !== "unknown") {
      try {
        const patient = await Patient.findById(patientId).lean();
        if (patient) {
          patientData = patient;
        }
      } catch (e) {
        console.log(
          "Invalid Patient ID or Patient not found, continuing without patient data",
        );
      }
    }

    // Build patient history with current medications if provided
    const fullProfile = {
      ...patientData,
      allergies: patientData.allergies || currentMedications || [],
      records: patientData.records || [
        {
          medications: (currentMedications || []).map((med) => ({
            name: med,
            active: true,
          })),
        },
      ],
    };

    const result = await aiService.checkDrugInteractions(fullProfile, drugName);
    res.json(result);
  } catch (err) {
    console.error("Drug Check Error:", err);
    res.status(500).json({
      safetyStatus: "Caution",
      severity: "Moderate",
      alerts: ["Server error during drug interaction check"],
      recommendations: ["Please try again later or contact support"],
      interactions: [],
      error: err.message,
    });
  }
});

router.post("/analyze-lab", async (req, res) => {
  try {
    const { testName, value, patientId } = req.body;

    let patient = {};
    if (patientId) {
      try {
        patient = await Patient.findById(patientId).lean();
      } catch (e) {
        console.log("Invalid Patient ID or Patient not found");
      }
    }

    const patientContext = {
      name: patient?.Name || "Unknown Patient",
      emergencyContact: {
        phone: patient?.Mobile_no,
      },
    };

    const result = await aiService.analyzeLabResult(
      testName,
      value,
      patientContext,
    );
    res.json(result);
  } catch (err) {
    console.error("Lab Analysis Error:", err);
    res.status(500).send("Lab Analysis Error");
  }
});

router.post("/smart-search", async (req, res) => {
  try {
    const { query, patientId } = req.body;

    // Fetch patient context if ID is provided
    let patientContext = "";
    if (patientId) {
      try {
        const patient = await Patient.findById(patientId).lean();
        if (patient) {
          patientContext = `
            Context: Patient Name: ${patient.Name}, Age: ${patient.Age}, 
            Medical History: ${JSON.stringify(patient.History)}
          `;
        }
      } catch (e) {
        console.log("Patient not found for smart search");
      }
    }

    const result = await aiService.generalSmartSearch(query, patientContext);
    res.json(result);
  } catch (err) {
    console.error("Smart Search Error:", err);
    res.status(500).send("Smart Search Error");
  }
});

router.post("/critical-alerts", async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ msg: "Patient ID is required" });
    }

    const patient = await Patient.findById(patientId).lean();

    if (!patient) {
      return res.status(404).json({ msg: "Patient not found" });
    }

    const records = patient.History || [];
    const fullProfile = { ...patient, records };

    // Analyze patient data for critical conditions
    const alerts = await aiService.analyzeCriticalConditions(fullProfile);

    res.json(alerts);
  } catch (err) {
    console.error("Critical Alerts Error:", err);
    res.status(500).json({
      msg: "Error analyzing critical alerts",
      error: err.message,
    });
  }
});

module.exports = router;
