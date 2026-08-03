const express = require("express");
const router = express.Router();
const AuditLog = require("../Models/AuditLog");
const { verifyToken, authorize } = require("../Middleware/rbac");

// GET /audit/logs — Paginated audit logs (admin only)
router.get("/logs", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.severity && req.query.severity !== "all") {
      filter.severity = req.query.severity;
    }
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }
    if (req.query.action && req.query.action !== "all") {
      filter.action = { $regex: req.query.action, $options: "i" };
    }
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: "i" };
      filter.$or = [
        { user: searchRegex },
        { action: searchRegex },
        { resource: searchRegex },
        { details: searchRegex },
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Audit logs fetch error:", err);
    res.status(500).json({ msg: "Error fetching audit logs" });
  }
});

// GET /audit/stats — Audit summary stats (admin only)
router.get("/stats", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalToday, securityEvents, failedLogins, recentUsers] =
      await Promise.all([
        AuditLog.countDocuments({ timestamp: { $gte: today } }),
        AuditLog.countDocuments({
          severity: "high",
          timestamp: { $gte: today },
        }),
        AuditLog.countDocuments({
          action: "User Login",
          status: "failed",
          timestamp: { $gte: today },
        }),
        AuditLog.distinct("user", { timestamp: { $gte: today } }),
      ]);

    res.json({
      totalToday,
      securityEvents,
      failedLogins,
      activeUsers: recentUsers.length,
    });
  } catch (err) {
    console.error("Audit stats error:", err);
    res.status(500).json({ msg: "Error fetching audit stats" });
  }
});

module.exports = router;
