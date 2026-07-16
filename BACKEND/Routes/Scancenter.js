const express = require("express");
const route = express.Router();
const ScanCenterSchema = require("../Models/ScanCenter");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Middleware = require("../Middleware/middleware");
const { verifyToken, authorize } = require("../Middleware/rbac");
const AdminSchema = require("../Models/AdminSchema");
const Hospital = require("../Models/AdminSchema");
const GoogleVerifyToken = require("../Middleware/GoogleVerifyToken");
const LoginMailAlert = require("../Mail/login");

route.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const check = await ScanCenterSchema.findOne({ Email_Address: username });
    if (!check) {
      res.json({
        msg: "Username not valid",
      });
    } else {
      const pass = await bcrypt.compare(password, check.Password);

      if (pass) {
        const admin = await AdminSchema.findById(check.AdminID);
        LoginMailAlert(username);
        const token = jwt.sign(
          { email: username, id: check._id, role: "scan_center" },
          "this is your secret key to login in bro",
          { expiresIn: "1d" },
        );
        return res.json({
          msg: "Username Found",
          objectID: check._id,
          photo: check.Image,
          jwt: token,
          HospitalName: admin.hospitalName,
          HospitalLogo: admin.logo,
          DoctorDOB: check.DOB,
          DoctorName: check.username,
        });
      } else {
        return res.json({
          msg: "Password incorrect",
        });
      }
    }
  } catch (err) {
    return res.json({
      msg: "Error in ScanCenter's Login",
    });
  }
});

route.post("/googleauth", async (req, res) => {
  try {
    const idToken = req.body.idToken;
    if (!idToken) {
      return res
        .status(400)
        .json({ success: false, message: "ID token is required" });
    }
    const result = await GoogleVerifyToken(idToken);
    if (!result.success) {
      return res.json({
        msg: "Google verification failed",
      });
    }
    const email = result.decodedToken.email;
    const check = await ScanCenterSchema.findOne({ Email_Address: email });

    if (!check) {
      return res.json({
        msg: "Username not valid",
      });
    }
    LoginMailAlert(email);
    const admin = await AdminSchema.findById(check.AdminID);
    const token = jwt.sign(
      { email, id: check._id, role: "scan_center" },
      "this is your secret key to login in bro",
      { expiresIn: "1d" },
    );
    return res.json({
      msg: "Username Found",
      objectID: check._id,
      photo: check.Image,
      jwt: token,
      HospitalName: admin.hospitalName,
      HospitalLogo: admin.logo,
      DoctorDOB: check.DOB,
      DoctorName: check.username,
    });
  } catch (err) {
    return res.json({
      msg: "Error in ScanCenter's Login",
    });
  }
});

route.post("/passchange", async (req, res) => {
  try {
    const { oldpass, newpass, objectID } = req.body;
    const doctor = await ScanCenterSchema.findById({ _id: objectID });
    const pass = await bcrypt.compare(oldpass, doctor.Password);
    if (pass) {
      const hashpassword = await bcrypt.hash(newpass, 10);
      const updated = await ScanCenterSchema.findByIdAndUpdate(
        { _id: objectID },
        { Password: hashpassword },
      );
      res.json({
        msg: "Password change Successfully",
      });
    } else {
      res.json({
        msg: "Old password incorrect",
      });
    }
  } catch (err) {
    res.json({
      msg: "Something wrong in password change",
    });
  }
});

// Update scan center by ID (used by Admin > Manage Scan Centers > Edit,
// and by a scan center editing their own profile)
route.put(
  "/update/:id",
  verifyToken,
  authorize("admin", "scan_center"),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (req.user.role === "scan_center" && req.user.id !== id) {
        return res
          .status(403)
          .json({ msg: "You can only update your own profile" });
      }
      const allowedFields = [
        "username",
        "Email_Address",
        "PhoneNo",
        "Current_Address",
        "Qualifications",
        "Specialization",
        "Years_of_experience",
        "DOB",
        "Gender",
        "Medical_License_Number",
        "Medical_Council_Registration_Number",
        "Image",
      ];
      const updates = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      }

      const updatedScanCenter = await ScanCenterSchema.findByIdAndUpdate(
        id,
        updates,
        { new: true },
      );

      if (!updatedScanCenter) {
        return res.status(404).json({ msg: "Scan center not found" });
      }

      res.json({
        msg: "Scan center updated successfully",
        scanCenter: updatedScanCenter,
      });
    } catch (err) {
      console.error("Update scan center error:", err);
      res.status(500).json({
        msg: "Error occurred while updating scan center",
        error: err.message,
      });
    }
  },
);

route.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // First find the scan center to get details
    const scanCenter = await ScanCenterSchema.findById(id);
    if (!scanCenter) {
      return res.json({
        msg: "Scan center not found in database",
      });
    }

    // Delete scan center from main collection
    const deletedScanCenter = await ScanCenterSchema.findByIdAndDelete(id);

    // Remove scan center references from all admin records
    await AdminSchema.updateMany(
      { managedScanCenters: id },
      { $pull: { managedScanCenters: id } },
    );

    if (deletedScanCenter) {
      res.json({
        msg: "Scan center deleted successfully from all portals",
        deletedScanCenter: {
          name: scanCenter.username,
          email: scanCenter.Email_Address,
        },
      });
    } else {
      res.json({
        msg: "Scan center not found in database",
      });
    }
  } catch (err) {
    console.error("Delete scan center error:", err);
    res.json({
      msg: "Error occurred while deleting scan center",
      error: err.message,
    });
  }
});

// Get all scan centers
route.get("/getall", async (req, res) => {
  try {
    const scanCenters = await ScanCenterSchema.find({}).select("-Password");
    res.json({
      msg: "Scan centers retrieved successfully",
      result: scanCenters,
    });
  } catch (err) {
    console.error("Get scan centers error:", err);
    res.json({
      msg: "Error occurred while fetching scan centers",
      error: err.message,
    });
  }
});

module.exports = route;
