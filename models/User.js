const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const kundliSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  dateOfBirth: { type: Date, required: true },
  timeOfBirth: { type: String, required: true }, // "HH:mm"
  placeOfBirth: { type: String, required: true }
}, { _id: true }); // Each kundli has its own _id

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true , default:"User"},
  phone: { type: String, unique: true, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isBlocked: { type: Boolean, default: false },
  walletBalance: { type: Number, default: 0 },
  // List of kundlis
  kundlis: [kundliSchema]

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
