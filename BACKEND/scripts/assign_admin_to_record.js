const mongoose = require("mongoose");
const argv = require("yargs/yargs")(process.argv.slice(2)).argv;

const URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medivault";

async function main() {
  const { type, adminId, email, name } = argv;
  if (!type || !adminId || (!email && !name)) {
    console.error(
      "Usage: node assign_admin_to_record.js --type=doctor|nurse|scancenter --adminId=<ADMIN_ID> --email=<email> | --name=<name>"
    );
    process.exit(1);
  }

  await mongoose.connect(URI);
  console.log("Connected to MongoDB");

  let Model;
  if (type === "doctor") Model = require("../Models/DoctorScheme");
  else if (type === "nurse") Model = require("../Models/NurseScheme");
  else if (type === "scancenter") Model = require("../Models/ScanCenter");
  else {
    console.error("Unknown type. Use doctor|nurse|scancenter");
    process.exit(1);
  }

  const query = {};
  if (email) query.Email_Address = email;
  if (name) query.Doctor_name = name;

  const doc = await Model.findOne(query);
  if (!doc) {
    console.error("No record found matching query:", query);
    process.exit(1);
  }

  doc.AdminID = adminId;
  await doc.save();
  console.log(`Updated ${type} record ${doc._id} - set AdminID=${adminId}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
