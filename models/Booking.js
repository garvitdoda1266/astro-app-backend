const { date } = require("joi");
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    astrologerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Astrologer",
      required: true,
    },

    // Booking day and time
    date: { type: Date, required: true },

    // Consultation details
    duration: { type: Number, required: true , default:0}, // in minutes (e.g., 30)
    amountDeducted: { type: Number,  required: true , default:0}, // total charged amount

    // Mode of consultation
    type: {
      type: String,
      enum: ["message", "audio", "video"],
      required: true,
    },

    // Booking status
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
