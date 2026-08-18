const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const col = mongoose.connection.db.collection("patientsschemas");
  const result = await col.updateOne(
    { MedicalId: "MED011" },
    { $set: { MedicalId: "UHID-1006" } },
  );
  console.log("Modified:", result.modifiedCount);
  const p = await col.findOne({ MedicalId: "UHID-1006" });
  if (p) {
    console.log("Verified — Name:", p.Name, "| New MedicalId:", p.MedicalId);
  } else {
    console.log("Patient not found after update (may already be UHID-1006).");
  }
  mongoose.disconnect();
});
