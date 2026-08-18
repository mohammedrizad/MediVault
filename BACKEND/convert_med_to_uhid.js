const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const col = mongoose.connection.db.collection("patientsschemas");

  // Find all MED-prefix patients sorted by their MED number
  const medPatients = await col
    .find({ MedicalId: /^MED/ })
    .sort({ MedicalId: 1 })
    .toArray();

  // Find the highest existing UHID number
  const lastUHID = await col
    .find({ MedicalId: /^UHID-/ })
    .sort({ MedicalId: -1 })
    .limit(1)
    .toArray();

  let nextNum = 1001;
  if (lastUHID.length > 0) {
    const num = parseInt(lastUHID[0].MedicalId.replace("UHID-", ""), 10);
    if (!isNaN(num)) nextNum = num + 1;
  }

  console.log("Starting UHID number:", nextNum);
  console.log("Patients to convert:", medPatients.length);

  for (const p of medPatients) {
    const newId = `UHID-${nextNum}`;
    await col.updateOne({ _id: p._id }, { $set: { MedicalId: newId } });
    console.log(`  ${p.MedicalId} -> ${newId} (${p.Name})`);
    nextNum++;
  }

  console.log("\nDone! All MED patients converted to UHID format.");
  mongoose.disconnect();
});
