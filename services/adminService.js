const User = require("../models/User");
const Astrologer = require("../models/Astrologer");
const Booking = require("../models/Booking");
const ApiError = require("../utils/ApiError");

// User management
exports.getAllUsers = async () => {
  return await User.find();
};

exports.toggleUserBlock = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  user.isBlocked = !user.isBlocked;
  await user.save();
  return user.isBlocked;
};


exports.approveAstrologer = async (astrologerId) => {
  const astrologer = await Astrologer.findById(astrologerId);
  if (!astrologer) throw new ApiError(404, "Astrologer not found");

  astrologer.verified = true;
  await astrologer.save();
  return astrologer;
};

// Bookings
exports.getAllBookings = async () => {
  return await Booking.find()
    .populate("user", "name email phone")
    .populate("astrologer", "name email phone expertise experience");
};
