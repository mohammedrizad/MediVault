const express = require('express');
const router = express.Router();
const DoctorScheme = require('../Models/DoctorScheme');
const NurseScheme = require('../Models/NurseScheme');
const ScanCenterSchema = require('../Models/ScanCenter');

// Get count of doctors
router.get('/doctors/count', async (req, res) => {
    try {
        const count = await DoctorScheme.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching doctor count' });
    }
});

// Get count of nurses
router.get('/nurses/count', async (req, res) => {
    try {
        const count = await NurseScheme.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching nurse count' });
    }
});

// Get count of scan centers
router.get('/scancenters/count', async (req, res) => {
    try {
        const count = await ScanCenterSchema.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching scan center count' });
    }
});

module.exports = router;