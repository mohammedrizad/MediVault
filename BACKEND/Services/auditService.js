const AuditLog = require("../Models/AuditLog");

/**
 * Log an audit event to the database.
 */
const logAudit = async ({
  user,
  role,
  action,
  resource,
  ip,
  severity,
  status,
  details,
  method,
  path,
}) => {
  try {
    await AuditLog.create({
      user: user || "unknown",
      role: role || "unknown",
      action,
      resource,
      ip: ip || "0.0.0.0",
      severity: severity || "info",
      status: status || "success",
      details: details || "",
      method,
      path,
    });
  } catch (err) {
    console.error("Audit log write failed:", err.message);
  }
};

/**
 * Express middleware that automatically logs every request.
 * Attach after auth middleware so req.user is available.
 */
const auditMiddleware = (req, res, next) => {
  const start = Date.now();

  // Capture original end to log after response
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    const user =
      req.user?.email ||
      req.user?.Email ||
      req.user?.user ||
      req.body?.email ||
      req.body?.adminuser ||
      "anonymous";
    const role = req.user?.role || "unknown";
    const ip =
      req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "0.0.0.0";
    const statusCode = res.statusCode;
    const isFailure = statusCode >= 400;

    // Determine action and severity from route
    const action = detectAction(req.method, req.path);
    const severity = detectSeverity(req.path, statusCode);
    const resource = detectResource(req.path);

    logAudit({
      user,
      role,
      action,
      resource,
      ip,
      severity,
      status: isFailure ? "failed" : "success",
      details: `${req.method} ${req.originalUrl} → ${statusCode} (${duration}ms)`,
      method: req.method,
      path: req.originalUrl,
    });

    originalEnd.apply(res, args);
  };

  next();
};

function detectAction(method, path) {
  if (path.includes("/login") || path.includes("/googleauth"))
    return "User Login";
  if (path.includes("/register")) return "User Registration";
  if (path.includes("/upload")) return "File Upload";
  if (path.includes("/download")) return "File Download";
  if (path.includes("/delete")) return "Record Deletion";
  if (path.includes("/password") || path.includes("/passchange"))
    return "Password Change";
  if (path.includes("/report") || path.includes("/entry"))
    return "Record Update";
  if (path.includes("/ai/")) return "AI Analysis";
  if (path.includes("/otp")) return "OTP Verification";
  if (path.includes("/access")) return "Access Request";
  if (path.includes("/alert")) return "Alert Management";
  if (method === "GET") return "Data Access";
  if (method === "POST") return "Data Modification";
  if (method === "PUT" || method === "PATCH") return "Record Update";
  return "System Action";
}

function detectSeverity(path, statusCode) {
  if (statusCode >= 500) return "high";
  if (path.includes("/delete")) return "high";
  if (path.includes("/login") && statusCode >= 400) return "high";
  if (path.includes("/password") || path.includes("/passchange"))
    return "medium";
  if (path.includes("/register") || path.includes("/upload")) return "medium";
  if (statusCode >= 400) return "medium";
  return "info";
}

function detectResource(path) {
  if (path.startsWith("/admin")) return "Admin Portal";
  if (path.startsWith("/doctor")) return "Doctor Portal";
  if (path.startsWith("/nurse")) return "Nurse Portal";
  if (path.startsWith("/patient")) return "Patient Portal";
  if (path.startsWith("/scan")) return "Scan Center";
  if (path.startsWith("/records")) return "File Storage";
  if (path.startsWith("/ai")) return "AI Analysis";
  if (path.startsWith("/otp")) return "OTP Service";
  if (path.startsWith("/access")) return "Cross-Hospital Access";
  if (path.startsWith("/alert")) return "Alert System";
  if (path.startsWith("/analytics")) return "Analytics";
  if (path.startsWith("/pews")) return "PEWS System";
  return "System";
}

module.exports = { logAudit, auditMiddleware };
