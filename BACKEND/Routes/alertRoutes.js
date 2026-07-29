const express = require("express");
const router = express.Router();
const AlertHistory = require("../Models/AlertHistory");

// GET /alerts/history - Fetch alert history with filters, search, sort, pagination
router.get("/history", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      sortBy = "timestamp",
      sortOrder = "desc",
      severity,
      alertType,
      acknowledged,
      search,
      startDate,
      endDate,
    } = req.query;

    // Build filter query
    const filter = {};

    if (severity) {
      filter.severity = severity;
    }

    if (alertType) {
      filter.alertType = alertType;
    }

    if (acknowledged !== undefined && acknowledged !== "") {
      filter.acknowledged = acknowledged === "true";
    }

    if (search) {
      filter.patientName = { $regex: search, $options: "i" };
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [alerts, totalCount] = await Promise.all([
      AlertHistory.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      AlertHistory.countDocuments(filter),
    ]);

    res.json({
      alerts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalAlerts: totalCount,
        perPage: limitNum,
        hasNext: pageNum * limitNum < totalCount,
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    console.error("Alert History Error:", err);
    res.status(500).json({ error: "Failed to fetch alert history" });
  }
});

// GET /alerts/stats - Aggregate stats for dashboard header
router.get("/stats", async (req, res) => {
  try {
    const [total, critical, unacknowledged, typeBreakdown] = await Promise.all([
      AlertHistory.countDocuments(),
      AlertHistory.countDocuments({ severity: "Critical" }),
      AlertHistory.countDocuments({ acknowledged: false }),
      AlertHistory.aggregate([
        { $group: { _id: "$alertType", count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      total,
      critical,
      unacknowledged,
      typeBreakdown: typeBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    });
  } catch (err) {
    console.error("Alert Stats Error:", err);
    res.status(500).json({ error: "Failed to fetch alert stats" });
  }
});

// PATCH /alerts/:id/acknowledge - Mark an alert as acknowledged
router.patch("/:id/acknowledge", async (req, res) => {
  try {
    const { acknowledgedBy } = req.body;

    const alert = await AlertHistory.findByIdAndUpdate(
      req.params.id,
      {
        acknowledged: true,
        status: "ACKNOWLEDGED",
        acknowledgedBy: acknowledgedBy || "Doctor",
        acknowledgedAt: new Date(),
      },
      { new: true },
    );

    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json({ message: "Alert acknowledged", alert });
  } catch (err) {
    console.error("Acknowledge Error:", err);
    res.status(500).json({ error: "Failed to acknowledge alert" });
  }
});

// POST /alerts/seed-demo - Seed demo alerts for testing
router.post("/seed-demo", async (req, res) => {
  try {
    const existing = await AlertHistory.countDocuments();
    if (existing > 5) {
      return res.json({
        message: `Already have ${existing} alerts, skipping seed.`,
      });
    }

    const demoAlerts = [
      {
        patientName: "Rajesh Kumar",
        recipientContact: "dr.sharma@hospital.com",
        message:
          "Critical: Blood glucose level at 450 mg/dL - immediate insulin adjustment required",
        alertType: "LAB_RESULT",
        severity: "Critical",
        status: "SENT",
        value: "Glucose: 450 mg/dL",
      },
      {
        patientName: "Priya Nair",
        recipientContact: "dr.sharma@hospital.com",
        message:
          "Dangerous drug interaction detected: Warfarin + Aspirin - high bleeding risk",
        alertType: "DRUG_INTERACTION",
        severity: "Critical",
        status: "SENT",
        value: "Warfarin + Aspirin",
      },
      {
        patientName: "Amit Singh",
        recipientContact: "+919876543210",
        message:
          "Blood pressure trending upward over last 3 visits: 140/90 → 155/95 → 168/102",
        alertType: "HEALTH_TREND",
        severity: "High",
        status: "SENT",
        value: "BP: 168/102 mmHg",
      },
      {
        patientName: "Sunita Devi",
        recipientContact: "dr.sharma@hospital.com",
        message:
          "Hemoglobin critically low at 6.2 g/dL - possible transfusion needed",
        alertType: "LAB_RESULT",
        severity: "Critical",
        status: "SENT",
        value: "Hb: 6.2 g/dL",
      },
      {
        patientName: "Mohammed Farooq",
        recipientContact: "+919876543211",
        message:
          "Follow-up overdue: Last cardiac check was 8 months ago, patient has history of arrhythmia",
        alertType: "FOLLOW_UP",
        severity: "Medium",
        status: "SENT",
        value: "Overdue: 8 months",
      },
      {
        patientName: "Lakshmi Iyer",
        recipientContact: "dr.sharma@hospital.com",
        message: "INR value at 4.8 - warfarin dose adjustment needed urgently",
        alertType: "LAB_RESULT",
        severity: "Critical",
        status: "SENT",
        value: "INR: 4.8",
      },
      {
        patientName: "Ravi Patel",
        recipientContact: "dr.sharma@hospital.com",
        message:
          "Metformin + Contrast dye interaction: Hold metformin 48hr before CT scan scheduled for Feb 18",
        alertType: "DRUG_INTERACTION",
        severity: "High",
        status: "SENT",
        value: "Metformin + Contrast",
      },
      {
        patientName: "Ananya Reddy",
        recipientContact: "+919876543212",
        message:
          "Potassium level at 6.1 mEq/L - risk of cardiac arrhythmia, immediate treatment required",
        alertType: "LAB_RESULT",
        severity: "Critical",
        status: "SENT",
        value: "K+: 6.1 mEq/L",
      },
      {
        patientName: "Vikram Chauhan",
        recipientContact: "dr.sharma@hospital.com",
        message:
          "Patient missed 3 consecutive diabetes follow-ups. HbA1c was 9.2% at last visit",
        alertType: "FOLLOW_UP",
        severity: "High",
        status: "SENT",
        value: "HbA1c: 9.2%",
        acknowledged: true,
        acknowledgedBy: "Dr. Sharma",
        acknowledgedAt: new Date(Date.now() - 3600000),
      },
      {
        patientName: "Deepa Menon",
        recipientContact: "dr.sharma@hospital.com",
        message:
          "Thyroid TSH level elevated at 12.5 mIU/L - medication adjustment recommended",
        alertType: "LAB_RESULT",
        severity: "Medium",
        status: "SENT",
        value: "TSH: 12.5 mIU/L",
      },
      {
        patientName: "Arjun Kapoor",
        recipientContact: "+919876543213",
        message:
          "Creatinine rising: 1.8 → 2.4 → 3.1 mg/dL over 3 months - nephrology consult needed",
        alertType: "HEALTH_TREND",
        severity: "Critical",
        status: "SENT",
        value: "Creatinine: 3.1 mg/dL",
      },
      {
        patientName: "Fatima Sheikh",
        recipientContact: "dr.sharma@hospital.com",
        message:
          "Low-risk: Mild vitamin D deficiency at 18 ng/mL – supplement recommended",
        alertType: "LAB_RESULT",
        severity: "Low",
        status: "SENT",
        value: "Vitamin D: 18 ng/mL",
        acknowledged: true,
        acknowledgedBy: "Dr. Sharma",
        acknowledgedAt: new Date(Date.now() - 7200000),
      },
    ];

    // Spread timestamps over the last 7 days
    const now = Date.now();
    demoAlerts.forEach((alert, index) => {
      alert.timestamp = new Date(now - index * 3600000 * 4); // every 4 hours
    });

    await AlertHistory.insertMany(demoAlerts);
    res.json({ message: `Seeded ${demoAlerts.length} demo alerts` });
  } catch (err) {
    console.error("Seed Error:", err);
    res.status(500).json({ error: "Failed to seed demo alerts" });
  }
});

module.exports = router;
