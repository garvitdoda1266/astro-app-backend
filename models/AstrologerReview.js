const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    astrologerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Astrologer",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent user from reviewing the same astrologer multiple times
reviewSchema.index({ astrologerId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
