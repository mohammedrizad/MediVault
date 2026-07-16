const jwt = require("jsonwebtoken");

const SECRET_KEY = "this is your secret key to login in bro";

/**
 * Verify JWT and attach decoded payload to req.user
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Access denied. No token provided." });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ msg: "Invalid or expired token." });
    }
    req.user = decoded;
    next();
  });
};

/**
 * Role-based access control middleware.
 * Usage: authorize("admin", "doctor") — allows only those roles.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ msg: "Access denied. No role in token." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          msg: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
        });
    }
    next();
  };
};

module.exports = { verifyToken, authorize, SECRET_KEY };
