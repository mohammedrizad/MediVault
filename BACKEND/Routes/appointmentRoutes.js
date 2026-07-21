const express = require("express");
const router = express.Router();
const Appointment = require("../Models/Appointment");

// List appointments, optionally filtered by patientId/doctorId/nurseId/scanCenterId/status/date
router.get("/", async (req, res) => {
  try {
    const { patientId, doctorId, nurseId, scanCenterId, status, date } =
      req.query;
    const query = {};
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;
    if (nurseId) query.nurseId = nurseId;
    if (scanCenterId) query.scanCenterId = scanCenterId;
    if (status) query.status = status;
    if (date) query.date = date;

    const appointments = await Appointment.find(query).sort({
      date: 1,
      time: 1,
    });
    res.json({ success: true, appointments });
  } catch (err) {
    console.error("Get appointments error:", err);
    res.status(500).json({ success: false, msg: "Error fetching appointments" });
  }
});

router.post("/", async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json({
      success: true,
      msg: "Appointment created successfully",
      appointment,
    });
  } catch (err) {
    console.error("Create appointment error:", err);
    res.status(500).json({ success: false, msg: "Error creating appointment" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!appointment) {
      return res.status(404).json({ success: false, msg: "Appointment not found" });
    }
    res.json({
      success: true,
      msg: "Appointment updated successfully",
      appointment,
    });
  } catch (err) {
    console.error("Update appointment error:", err);
    res.status(500).json({ success: false, msg: "Error updating appointment" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, msg: "Appointment not found" });
    }
    res.json({ success: true, msg: "Appointment deleted successfully" });
  } catch (err) {
    console.error("Delete appointment error:", err);
    res.status(500).json({ success: false, msg: "Error deleting appointment" });
  }
});

module.exports = router;
