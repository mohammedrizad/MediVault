const express = require("express");
const route = express.Router();
const NurseSchema = require("../Models/NurseScheme");
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
    const check = await NurseSchema.findOne({ Email_Address: username });
    if (!check) {
      res.json({
        msg: "Username not valid",
      });
    } else {
      const pass = await bcrypt.compare(password, check.Password);

      if (pass) {
        const admin = await AdminSchema.findById(check.AdminID);
        const user = check.Email_Address;
        LoginMailAlert(user);
        const token = jwt.sign(
          { user, id: check._id, role: "nurse" },
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
          DoctorName: check.Doctor_name,
        });
      } else {
        return res.json({
          msg: "Password incorrect",
        });
      }
    }
  } catch (err) {
    return res.json({
      msg: "Error in Nurse's Login",
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
    const check = await NurseSchema.findOne({ Email_Address: email });
    if (!check) {
      return res.json({
        msg: "Username not valid",
      });
    }
    LoginMailAlert(email);
    const admin = await AdminSchema.findById(check.AdminID);
    const user = check.Email_Address;
    const token = jwt.sign(
      { user, id: check._id, role: "nurse" },
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
      DoctorName: check.Doctor_name,
    });
  } catch (err) {
    return res.json({
      msg: "Error in Nurse's Login",
    });
  }
});

route.post("/passchange", verifyToken, authorize("nurse"), async (req, res) => {
  try {
    const { oldpass, newpass, objectID } = req.body;
    const doctor = await NurseSchema.findById({ _id: objectID });
    const pass = await bcrypt.compare(oldpass, doctor.Password);
    if (pass) {
      const hashpassword = await bcrypt.hash(newpass, 10);
      const updated = await NurseSchema.findByIdAndUpdate(
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

// Update nurse by ID (used by Admin > Manage Nurses > Edit, and by a
// nurse editing their own profile)
route.put(
  "/update/:id",
  verifyToken,
  authorize("admin", "nurse"),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (req.user.role === "nurse" && req.user.id !== id) {
        return res
          .status(403)
          .json({ msg: "You can only update your own profile" });
      }
      const allowedFields = [
        "Doctor_name",
        "Email_Address",
        "PhoneNo",
        "Specialization",
        "Years_of_experience",
        "Current_Address",
        "Qualifications",
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

      const updatedNurse = await NurseSchema.findByIdAndUpdate(id, updates, {
        new: true,
      });

      if (!updatedNurse) {
        return res.status(404).json({ msg: "Nurse not found" });
      }

      res.json({ msg: "Nurse updated successfully", nurse: updatedNurse });
    } catch (err) {
      console.error("Update nurse error:", err);
      res.status(500).json({
        msg: "Error occurred while updating nurse",
        error: err.message,
      });
    }
  },
);

// Delete nurse by ID - Remove from all portals
route.delete(
  "/delete/:id",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // First find the nurse to get details
      const nurse = await NurseSchema.findById(id);
      if (!nurse) {
        return res.json({
          msg: "Nurse not found in database",
        });
      }

      // Delete nurse from main collection
      const deletedNurse = await NurseSchema.findByIdAndDelete(id);

      // Remove nurse references from admin records
      await AdminSchema.updateMany(
        { managedNurses: id },
        { $pull: { managedNurses: id } },
      );

      // Update patients who had this nurse assigned
      const PatientSchemas = require("../Models/PatientsSchema");
      await PatientSchemas.updateMany(
        { assignedNurse: id },
        { $unset: { assignedNurse: "" } },
      );

      if (deletedNurse) {
        res.json({
          msg: "Nurse deleted successfully from all portals",
          deletedNurse: {
            name: nurse.Doctor_name,
            email: nurse.Email_Address,
          },
        });
      } else {
        res.json({
          msg: "Nurse not found in database",
        });
      }
    } catch (err) {
      console.error("Delete nurse error:", err);
      res.json({
        msg: "Error occurred while deleting nurse",
        error: err.message,
      });
    }
  },
);

// Register Nurse (called by DataService)
route.post("/register", async (req, res) => {
  try {
    const {
      AdminID,
      Doctor_name, // Frontend sends 'name' mapped to 'Doctor_name' in schema
      Email_Address,
      PhoneNo,
      Specialization,
      Years_of_experience,
      Current_Address,
      Qualifications,
      DOB,
      Gender,
      Medical_License_Number,
      Medical_Council_Registration_Number,
      Date_Joined,
      Day_Joined,
      Time_Joined,
      Image,
    } = req.body;

    const check = await NurseSchema.findOne({ Email_Address });
    if (check) {
      return res.json({ msg: "Nurse already exists with this email" });
    }

    // Use Medical_License_Number as default password
    const hashpassword = await bcrypt.hash(Medical_License_Number, 10);

    const nurse = new NurseSchema({
      AdminID,
      Doctor_name,
      Email_Address,
      PhoneNo,
      Specialization,
      Years_of_experience,
      Current_Address,
      Qualifications,
      DOB,
      Gender,
      Medical_License_Number,
      Medical_Council_Registration_Number,
      Date_Joined,
      Day_Joined,
      Time_Joined,
      Image,
      Password: hashpassword,
    });

    await nurse.save();

    res.json({
      msg: "Nurse registered successfully",
      nurse: nurse,
    });
  } catch (err) {
    console.error("Error in nurse registration:", err);
    res.status(500).json({ msg: "Error occurred in nurse registration" });
  }
});

// Get all nurses
route.get("/getall", async (req, res) => {
  try {
    const nurses = await NurseSchema.find({}).select("-Password");
    res.json({
      msg: "Nurses retrieved successfully",
      nurses: nurses,
    });
  } catch (err) {
    console.error("Get nurses error:", err);
    res.json({
      msg: "Error retrieving nurses",
      error: err.message,
    });
  }
});

module.exports = route;
