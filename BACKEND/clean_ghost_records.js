const mongoose = require("mongoose");
const DoctorScheme = require("./Models/DoctorScheme");
const NurseScheme = require("./Models/NurseScheme");
require("dotenv").config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/MediVault";

async function cleanGhostRecords() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Delete Doctors with undefined/null names or emails
    const doctorResult = await DoctorScheme.deleteMany({
      $or: [
        { Doctor_name: { $exists: false } },
        { Doctor_name: null },
        { Email_Address: { $exists: false } },
        { Email_Address: null },
      ],
    });
    console.log(`Deleted ${doctorResult.deletedCount} invalid Doctor records.`);

    // 2. Delete Nurses with undefined/null names or emails
    const nurseResult = await NurseScheme.deleteMany({
      $or: [
        { Doctor_name: { $exists: false } }, // Note: Nurse schema uses Doctor_name field
        { Doctor_name: null },
        { Email_Address: { $exists: false } },
        { Email_Address: null },
      ],
    });
    console.log(`Deleted ${nurseResult.deletedCount} invalid Nurse records.`);

    // 3. Verify remaining counts
    const remainingDoctors = await DoctorScheme.countDocuments();
    const remainingNurses = await NurseScheme.countDocuments();

    console.log(`\nRemaining Valid Doctors: ${remainingDoctors}`);
    console.log(`Remaining Valid Nurses: ${remainingNurses}`);
  } catch (error) {
    console.error("Error cleaning records:", error);
  } finally {
    await mongoose.disconnect();
  }
}

cleanGhostRecords();
