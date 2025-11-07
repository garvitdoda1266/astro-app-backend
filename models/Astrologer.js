const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Consultation fees for different modes
const consultationFeeSchema = new mongoose.Schema(
  {
    message: { type: Number, default: 0 },
    audio: { type: Number, default: 0 },
    video: { type: Number, default: 0 },
  },
  { _id: false }
);

// Bank details structure
const bankDetailsSchema = new mongoose.Schema(
  {
    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
  },
  { _id: false }
);

// Category + Subcategory structure
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Astrology", "Healing"
    subCategories: [{ type: String }],      // e.g. ["Love", "Career", "Legal"]
  },
  { _id: false }
);

// Astrologer schema
const astrologerSchema = new mongoose.Schema(
  {
    // Basic info
    profileName: { type: String },
    phone: { type: String, required: true, unique: true },

    // Profile details
    displayImage: [{ type: String }],
    aboutMe: { type: String },
    experience: { type: Number, default: 0 },
    skills: [{ type: String }],
    category: [categorySchema], // <-- updated structure
    languagesKnown: [{ type: String }],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    role: { type: String, default: "astrologer" },

    // KYC & Proofs
    idProofFrontImage: { type: String },
    idProofBackImage: { type: String },
    addressProofFrontImage: { type: String },
    addressProofBackImage: { type: String },

    // Consultation & working details
    workingDays: [{ type: Number }],
    consultationFee: consultationFeeSchema,
    earnings: { type: Number, default: 0 },

    // Wallet & banking
    bankDetails: bankDetailsSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Astrologer", astrologerSchema);
