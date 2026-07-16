const express = require("express");
const route = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Admin = require("../Models/AdminSchema");
const GoogleVerifyToken = require("../Middleware/GoogleVerifyToken");
const LoginMailAlert = require("../Mail/login");

route.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === "medivault.government@gmail.com" &&
      password === "medivault"
    ) {
      LoginMailAlert(email);
      const token = jwt.sign(
        { email, role: "admin" },
        "this is your secret key to login in bro",
        { expiresIn: "1d" },
      );
      return res.json({
        msg: "Access Granted",
        token,
      });
    }
    return res.json({
      msg: "Access Denied",
    });
  } catch (err) {
    res.json({
      mag: "Error Occurred in Server",
    });
  }
});

route.post("/googleauth", async (req, res) => {
  try {
    const idToken = req.body.idToken;
    if (!idToken) {
      return res.json({ success: false, msg: "ID token is required" });
    }
    const result = await GoogleVerifyToken(idToken);
    if (!result.success) {
      return res.json({
        msg: "Google verification failed",
      });
    }
    const email = result.decodedToken.email;

    if (email === "medivault.government@gmail.com") {
      LoginMailAlert(email);
      const token = jwt.sign(
        { email, role: "admin" },
        "this is your secret key to login in bro",
        { expiresIn: "1d" },
      );
      return res.json({
        msg: "Access Granted",
        token,
      });
    }
    return res.json({
      msg: "Access Denied",
    });
  } catch (err) {
    res.json({
      mag: "Error Occurred in Server",
    });
  }
});

route.post("/addhospitals", async (req, res) => {
  try {
    const {
      hospitalName,
      ownerName,
      email,
      address,
      phone,
      timings,
      closedOn,
      logo,
      specialties,
      numberOfBeds,
    } = req.body;

    // Hash the default password "12345"
    const saltRounds = 10; // Higher number means more secure but slower hashing
    const hashedPassword = await bcrypt.hash("12345", saltRounds);

    const newHospital = new Admin({
      hospitalName,
      ownerName,
      email,
      password: hashedPassword,
      address,
      phone,
      timings,
      closedOn,
      logo,
      specialties,
      numberOfBeds,
    });

    await newHospital.save();

    res.json({
      message: "Hospital added successfully",
    });
  } catch (error) {
    res.json({ msg: error.message });
  }
});

route.get("/gethospitals", async (req, res) => {
  try {
    const hospitals = await Admin.find().select("-password");
    res.json({
      msg: "Hospital List are reterived",
      hospitals,
    });
  } catch (error) {
    res.json({ msg: error.message });
  }
});

module.exports = route;
