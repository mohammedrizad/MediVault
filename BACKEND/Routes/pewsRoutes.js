const express = require("express");
const route = express.Router();
const EarlyWarningScore = require("../Models/EarlyWarningScore");
const AlertHistory = require("../Models/AlertHistory");
const PatientSchemas = require("../Models/PatientsSchema");

// ─── Scoring functions (exact rules from requirements) ───

function scoreHeartRate(hr) {
  if (hr >= 60 && hr <= 100) return { score: 0, status: "Normal" };
  if ((hr >= 50 && hr <= 59) || (hr >= 101 && hr <= 110))
    return { score: 1, status: "Borderline" };
  if ((hr >= 40 && hr <= 49) || (hr >= 111 && hr <= 130))
    return { score: 2, status: "Concerning" };
  return { score: 3, status: "Critical" };
}

function scoreSystolicBP(sbp) {
  if (sbp >= 90 && sbp <= 140) return { score: 0, status: "Normal" };
  if ((sbp >= 80 && sbp <= 89) || (sbp >= 141 && sbp <= 160))
    return { score: 1, status: "Borderline" };
  if ((sbp >= 70 && sbp <= 79) || (sbp >= 161 && sbp <= 180))
    return { score: 2, status: "Concerning" };
  return { score: 3, status: "Critical" };
}

function scoreTemperature(temp) {
  if (temp >= 36.5 && temp <= 37.5) return { score: 0, status: "Normal" };
  if ((temp >= 36.0 && temp <= 36.4) || (temp >= 37.6 && temp <= 38.0))
    return { score: 1, status: "Borderline" };
  if ((temp >= 35.5 && temp <= 35.9) || (temp >= 38.1 && temp <= 39.0))
    return { score: 2, status: "Concerning" };
  return { score: 3, status: "Critical" };
}

function scoreRespiratoryRate(rr) {
  if (rr >= 12 && rr <= 20) return { score: 0, status: "Normal" };
  if ((rr >= 9 && rr <= 11) || (rr >= 21 && rr <= 25))
    return { score: 1, status: "Borderline" };
  if ((rr >= 6 && rr <= 8) || (rr >= 26 && rr <= 30))
    return { score: 2, status: "Concerning" };
  return { score: 3, status: "Critical" };
}

function scoreOxygenSaturation(spo2) {
  if (spo2 >= 95) return { score: 0, status: "Normal" };
  if (spo2 >= 92 && spo2 <= 94) return { score: 1, status: "Borderline" };
  if (spo2 >= 88 && spo2 <= 91) return { score: 2, status: "Concerning" };
  return { score: 3, status: "Critical" };
}

function getRiskLevel(totalScore) {
  if (totalScore <= 2) return "Low";
  if (totalScore <= 5) return "Medium";
  if (totalScore <= 9) return "High";
  return "Critical";
}

function getRecommendation(riskLevel) {
  switch (riskLevel) {
    case "Low":
      return "Patient stable, routine monitoring";
    case "Medium":
      return "Increased monitoring recommended";
    case "High":
      return "Urgent medical review required";
    case "Critical":
      return "Immediate intervention needed";
    default:
      return "Assessment required";
  }
}

// ────────────────────────────────────────────────────────────
//  POST /analytics/early-warning-score
//  Calculate PEWS, store in DB, generate alert if High/Critical
// ────────────────────────────────────────────────────────────
route.post("/early-warning-score", async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      doctorId,
      doctorName,
      heartRate,
      systolicBP,
      diastolicBP,
      temperature,
      respiratoryRate,
      oxygenSaturation,
      notes,
    } = req.body;

    if (!patientId || !patientName) {
      return res
        .status(400)
        .json({ msg: "patientId and patientName are required" });
    }

    // Validate all vitals present
    const vitals = {
      heartRate: Number(heartRate),
      systolicBP: Number(systolicBP),
      diastolicBP: Number(diastolicBP),
      temperature: Number(temperature),
      respiratoryRate: Number(respiratoryRate),
      oxygenSaturation: Number(oxygenSaturation),
    };

    for (const [key, val] of Object.entries(vitals)) {
      if (isNaN(val) || val === null || val === undefined) {
        return res.status(400).json({ msg: `Invalid value for ${key}` });
      }
    }

    // Calculate breakdown
    const hrResult = scoreHeartRate(vitals.heartRate);
    const bpResult = scoreSystolicBP(vitals.systolicBP);
    const tempResult = scoreTemperature(vitals.temperature);
    const rrResult = scoreRespiratoryRate(vitals.respiratoryRate);
    const spo2Result = scoreOxygenSaturation(vitals.oxygenSaturation);

    const breakdown = [
      {
        name: "Heart Rate",
        value: vitals.heartRate,
        unit: "bpm",
        score: hrResult.score,
        status: hrResult.status,
      },
      {
        name: "Blood Pressure (Systolic)",
        value: vitals.systolicBP,
        unit: "mmHg",
        score: bpResult.score,
        status: bpResult.status,
      },
      {
        name: "Temperature",
        value: vitals.temperature,
        unit: "°C",
        score: tempResult.score,
        status: tempResult.status,
      },
      {
        name: "Respiratory Rate",
        value: vitals.respiratoryRate,
        unit: "breaths/min",
        score: rrResult.score,
        status: rrResult.status,
      },
      {
        name: "Oxygen Saturation",
        value: vitals.oxygenSaturation,
        unit: "%",
        score: spo2Result.score,
        status: spo2Result.status,
      },
    ];

    const totalScore =
      hrResult.score +
      bpResult.score +
      tempResult.score +
      rrResult.score +
      spo2Result.score;

    const riskLevel = getRiskLevel(totalScore);
    const recommendation = getRecommendation(riskLevel);

    // Check previous score to detect risk level change
    const previousScore = await EarlyWarningScore.findOne({ patientId })
      .sort({ timestamp: -1 })
      .lean();

    const riskChanged = previousScore && previousScore.riskLevel !== riskLevel;

    // Save to database
    const newScore = new EarlyWarningScore({
      patientId,
      patientName,
      doctorId: doctorId || "",
      doctorName: doctorName || "",
      vitals,
      breakdown,
      totalScore,
      riskLevel,
      recommendation,
      alertGenerated: riskLevel === "High" || riskLevel === "Critical",
      notes: notes || "",
    });

    await newScore.save();

    // Generate alert if High or Critical
    if (riskLevel === "High" || riskLevel === "Critical") {
      try {
        const alert = new AlertHistory({
          patientName: patientName,
          recipientContact: doctorName || "Attending Physician",
          message: `PEWS Alert: ${patientName} has a ${riskLevel} risk score of ${totalScore}/15. ${recommendation}. Abnormal vitals: ${breakdown
            .filter((b) => b.status !== "Normal")
            .map((b) => `${b.name}: ${b.value}${b.unit} (${b.status})`)
            .join(", ")}`,
          alertType: "HEALTH_TREND",
          severity: riskLevel === "Critical" ? "Critical" : "High",
          status: "PENDING",
        });
        await alert.save();
      } catch (alertErr) {
        console.error("Failed to create PEWS alert:", alertErr.message);
      }
    }

    return res.json({
      msg: "Early warning score calculated",
      score: {
        _id: newScore._id,
        totalScore,
        riskLevel,
        recommendation,
        breakdown,
        alertGenerated: newScore.alertGenerated,
        riskChanged,
        previousRiskLevel: previousScore ? previousScore.riskLevel : null,
        timestamp: newScore.timestamp,
      },
    });
  } catch (err) {
    console.error("PEWS calculation error:", err);
    res
      .status(500)
      .json({
        msg: "Error calculating early warning score",
        error: err.message,
      });
  }
});

// ────────────────────────────────────────────────────────────
//  GET /analytics/pews-history/:patientId
//  Get score history for trend chart
// ────────────────────────────────────────────────────────────
route.get("/pews-history/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const history = await EarlyWarningScore.find({ patientId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return res.json({
      msg: "PEWS history retrieved",
      history: history.reverse(), // chronological order
    });
  } catch (err) {
    console.error("PEWS history error:", err);
    res
      .status(500)
      .json({ msg: "Error fetching PEWS history", error: err.message });
  }
});

// ────────────────────────────────────────────────────────────
//  GET /analytics/pews-patients
//  Get list of patients for dropdown
// ────────────────────────────────────────────────────────────
route.get("/pews-patients", async (req, res) => {
  try {
    const patients = await PatientSchemas.find({}, "Name MedicalId _id").lean();
    return res.json({
      msg: "Patients list",
      patients: patients.map((p) => ({
        id: p._id.toString(),
        name: p.Name || "Unknown",
        medicalId: p.MedicalId || "",
      })),
    });
  } catch (err) {
    console.error("PEWS patients error:", err);
    res
      .status(500)
      .json({ msg: "Error fetching patients", error: err.message });
  }
});

// ────────────────────────────────────────────────────────────
//  POST /analytics/pews-seed-demo
//  Seed demo PEWS history for testing
// ────────────────────────────────────────────────────────────
route.post("/pews-seed-demo", async (req, res) => {
  try {
    const existing = await EarlyWarningScore.countDocuments();
    if (existing > 0) {
      return res.json({ msg: "Demo data already exists", count: existing });
    }

    const demoPatientId = "demo-patient-001";
    const demoPatientName = "John Doe";
    const now = Date.now();

    const demoEntries = [
      { hr: 72, sbp: 120, dbp: 80, temp: 36.8, rr: 16, spo2: 98, daysAgo: 14 },
      { hr: 78, sbp: 118, dbp: 78, temp: 37.0, rr: 17, spo2: 97, daysAgo: 12 },
      { hr: 88, sbp: 135, dbp: 85, temp: 37.4, rr: 19, spo2: 96, daysAgo: 10 },
      { hr: 95, sbp: 142, dbp: 90, temp: 37.8, rr: 22, spo2: 94, daysAgo: 8 },
      { hr: 105, sbp: 148, dbp: 92, temp: 38.2, rr: 24, spo2: 93, daysAgo: 6 },
      { hr: 110, sbp: 155, dbp: 95, temp: 38.5, rr: 26, spo2: 91, daysAgo: 4 },
      { hr: 98, sbp: 145, dbp: 88, temp: 38.0, rr: 22, spo2: 93, daysAgo: 2 },
      { hr: 82, sbp: 125, dbp: 82, temp: 37.2, rr: 18, spo2: 96, daysAgo: 1 },
    ];

    const docs = [];
    for (const entry of demoEntries) {
      const hrR = scoreHeartRate(entry.hr);
      const bpR = scoreSystolicBP(entry.sbp);
      const tempR = scoreTemperature(entry.temp);
      const rrR = scoreRespiratoryRate(entry.rr);
      const spo2R = scoreOxygenSaturation(entry.spo2);

      const breakdown = [
        {
          name: "Heart Rate",
          value: entry.hr,
          unit: "bpm",
          score: hrR.score,
          status: hrR.status,
        },
        {
          name: "Blood Pressure (Systolic)",
          value: entry.sbp,
          unit: "mmHg",
          score: bpR.score,
          status: bpR.status,
        },
        {
          name: "Temperature",
          value: entry.temp,
          unit: "°C",
          score: tempR.score,
          status: tempR.status,
        },
        {
          name: "Respiratory Rate",
          value: entry.rr,
          unit: "breaths/min",
          score: rrR.score,
          status: rrR.status,
        },
        {
          name: "Oxygen Saturation",
          value: entry.spo2,
          unit: "%",
          score: spo2R.score,
          status: spo2R.status,
        },
      ];

      const totalScore =
        hrR.score + bpR.score + tempR.score + rrR.score + spo2R.score;
      const riskLevel = getRiskLevel(totalScore);

      docs.push({
        patientId: demoPatientId,
        patientName: demoPatientName,
        doctorId: "demo-doctor-001",
        doctorName: "Dr. Smith",
        vitals: {
          heartRate: entry.hr,
          systolicBP: entry.sbp,
          diastolicBP: entry.dbp,
          temperature: entry.temp,
          respiratoryRate: entry.rr,
          oxygenSaturation: entry.spo2,
        },
        breakdown,
        totalScore,
        riskLevel,
        recommendation: getRecommendation(riskLevel),
        alertGenerated: riskLevel === "High" || riskLevel === "Critical",
        timestamp: new Date(now - entry.daysAgo * 86400000),
      });
    }

    await EarlyWarningScore.insertMany(docs);
    return res.json({ msg: "Demo PEWS data seeded", count: docs.length });
  } catch (err) {
    console.error("PEWS seed error:", err);
    res
      .status(500)
      .json({ msg: "Error seeding demo data", error: err.message });
  }
});

module.exports = route;
