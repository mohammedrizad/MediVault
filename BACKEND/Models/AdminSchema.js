const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true,
    trim: true,
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  timings: {
    type: String,
    required: true,
    trim: true,
  },
  closedOn: {
    type: String,
    default: "None",
  },
  logo: {
    type: String,
    required: true,
    trim: true,
  },
  specialties: {
    type: String,
    required: true,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  numberOfBeds: {
    type: Number,
    required: true,
    min: [1, "Number of beds must be at least 1"],
  },
});

const Hospital = mongoose.model("Hospital", hospitalSchema);

module.exports = Hospital;
