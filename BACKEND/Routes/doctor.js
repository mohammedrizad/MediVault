const express = require("express");
const route = express.Router();
const DoctorSchema = require("../Models/DoctorScheme");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Middleware = require("../Middleware/middleware");
const { verifyToken, authorize } = require("../Middleware/rbac");
const AdminSchema = require("../Models/AdminSchema");
const GoogleVerifyToken = require("../Middleware/GoogleVerifyToken");
const LoginMailAlert = require("../Mail/login");

route.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const check = await DoctorSchema.findOne({ Email_Address: username });
    if (!check) {
      return res.json({
        msg: "Username not valid",
      });
    }
    const pass = await bcrypt.compare(password, check.Password);

    if (pass) {
      const user = check.Email_Address;
      LoginMailAlert(user);
      const token = jwt.sign(
        { user, id: check._id, role: "doctor" },
        "this is your secret key to login in bro",
        { expiresIn: "1d" },
      );
      const admin = await AdminSchema.findById(check.AdminID);
      return res.json({
        msg: "Username Found",
        objectID: check._id,
        photo: check.Image,
        jwt: token,
        Hospitalname: admin.hospitalName,
        HospitalLogo: admin.logo,
        DoctorDOB: check.DOB,
        DoctorName: check.Doctor_name,
      });
    } else {
      return res.json({
        msg: "Password incorrect",
      });
    }
  } catch (err) {
    res.json({
      msg: `Error in Doctor's Login${err}`,
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
    const check = await DoctorSchema.findOne({ Email_Address: email });
    if (!check) {
      return res.json({
        msg: "Username not valid",
      });
    }
    LoginMailAlert(email);
    const user = check.Email_Address;
    const token = jwt.sign(
      { user, id: check._id, role: "doctor" },
      "this is your secret key to login in bro",
      { expiresIn: "1d" },
    );
    const admin = await AdminSchema.findById(check.AdminID);
    return res.json({
      msg: "Username Found",
      objectID: check._id,
      photo: check.Image,
      jwt: token,
      Hospitalname: admin.hospitalName,
      HospitalLogo: admin.logo,
      DoctorDOB: check.DOB,
      DoctorName: check.Doctor_name,
    });
  } catch (err) {
    res.json({
      msg: "Error in Doctor's Login",
    });
  }
});

route.post(
  "/passchange",
  verifyToken,
  authorize("doctor"),
  async (req, res) => {
    try {
      const { oldpass, newpass, objectID } = req.body;
      const doctor = await DoctorSchema.findById({ _id: objectID });
      const pass = await bcrypt.compare(oldpass, doctor.Password);
      if (pass) {
        const hashpassword = await bcrypt.hash(newpass, 10);
        const updated = await DoctorSchema.findByIdAndUpdate(
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
  },
);

// Update doctor by ID (used by Admin > Manage Doctors > Edit, and by a
// doctor editing their own profile)
route.put(
  "/update/:id",
  verifyToken,
  authorize("admin", "doctor"),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (req.user.role === "doctor" && req.user.id !== id) {
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
        "Contract_type",
        "Image",
      ];
      const updates = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      }

      const updatedDoctor = await DoctorSchema.findByIdAndUpdate(id, updates, {
        new: true,
      });

      if (!updatedDoctor) {
        return res.status(404).json({ msg: "Doctor not found" });
      }

      res.json({ msg: "Doctor updated successfully", doctor: updatedDoctor });
    } catch (err) {
      console.error("Update doctor error:", err);
      res.status(500).json({
        msg: "Error occurred while updating doctor",
        error: err.message,
      });
    }
  },
);

// Delete doctor by ID - Remove from all portals
route.delete(
  "/delete/:id",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // First find the doctor to get details
      const doctor = await DoctorSchema.findById(id);
      if (!doctor) {
        return res.json({
          msg: "Doctor not found in database",
        });
      }

      // Delete doctor from main collection
      const deletedDoctor = await DoctorSchema.findByIdAndDelete(id);

      // Remove doctor references from admin records
      await AdminSchema.updateMany(
        { managedDoctors: id },
        { $pull: { managedDoctors: id } },
      );

      // Update patients who had this doctor assigned
      const PatientSchemas = require("../Models/PatientsSchema");
      await PatientSchemas.updateMany(
        { assignedDoctor: id },
        { $unset: { assignedDoctor: "" } },
      );

      if (deletedDoctor) {
        res.json({
          msg: "Doctor deleted successfully from all portals",
          deletedDoctor: {
            name: doctor.Doctor_name,
            email: doctor.Email_Address,
          },
        });
      } else {
        res.json({
          msg: "Doctor not found in database",
        });
      }
    } catch (err) {
      console.error("Delete doctor error:", err);
      res.json({
        msg: "Error occurred while deleting doctor",
        error: err.message,
      });
    }
  },
);

// Get all doctors
route.get("/getall", async (req, res) => {
  try {
    const doctors = await DoctorSchema.find({}).select("-Password");
    res.json({
      msg: "Doctors retrieved successfully",
      doctors: doctors,
    });
  } catch (err) {
    console.error("Get doctors error:", err);
    res.json({
      msg: "Error retrieving doctors",
      error: err.message,
    });
  }
});

// Register Doctor (called by DataService)
route.post("/register", async (req, res) => {
  try {
    const {
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
      Contract_type,
      Date_Joined,
      Day_Joined,
      Time_Joined,
      Image,
    } = req.body;

    const check = await DoctorSchema.findOne({ Email_Address });
    if (check) {
      return res.json({ msg: "Doctor already exists with this email" });
    }

    // Use Medical_License_Number as default password
    const hashpassword = await bcrypt.hash(Medical_License_Number, 10);

    const doctor = new DoctorSchema({
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
      Contract_type,
      Date_Joined,
      Day_Joined,
      Time_Joined,
      Image,
      Password: hashpassword,
    });

    await doctor.save();

    res.json({
      msg: "Doctor registered successfully",
      doctor: doctor,
    });
  } catch (err) {
    console.error("Error in doctor registration:", err);
    res.status(500).json({ msg: "Error occurred in doctor registration" });
  }
});

module.exports = route;
