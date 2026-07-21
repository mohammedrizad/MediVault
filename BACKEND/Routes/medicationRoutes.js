const express = require("express");
const router = express.Router();
const Medication = require("../Models/Medication");

router.get("/", async (req, res) => {
  try {
    const { patientId, status } = req.query;
    const query = {};
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;

    const medications = await Medication.find(query).sort({ createdAt: -1 });
    res.json({ success: true, medications });
  } catch (err) {
    console.error("Get medications error:", err);
    res.status(500).json({ success: false, msg: "Error fetching medications" });
  }
});

router.post("/", async (req, res) => {
  try {
    const medication = new Medication(req.body);
    await medication.save();
    res.status(201).json({
      success: true,
      msg: "Medication added successfully",
      medication,
    });
  } catch (err) {
    console.error("Create medication error:", err);
    res.status(500).json({ success: false, msg: "Error adding medication" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const medication = await Medication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!medication) {
      return res.status(404).json({ success: false, msg: "Medication not found" });
    }
    res.json({
      success: true,
      msg: "Medication updated successfully",
      medication,
    });
  } catch (err) {
    console.error("Update medication error:", err);
    res.status(500).json({ success: false, msg: "Error updating medication" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const medication = await Medication.findByIdAndDelete(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, msg: "Medication not found" });
    }
    res.json({ success: true, msg: "Medication deleted successfully" });
  } catch (err) {
    console.error("Delete medication error:", err);
    res.status(500).json({ success: false, msg: "Error deleting medication" });
  }
});

module.exports = router;
