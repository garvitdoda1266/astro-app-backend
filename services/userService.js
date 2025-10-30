const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const Transaction = require('../models/Transaction');

// Fetch user profile
exports.getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

// Update profile
exports.updateUser = async (userId, updates) => {
  const allowedFields = ["name", "phone"];
  const data = {};

  for (const key of allowedFields) {
    if (updates[key]) data[key] = updates[key];
  }

  const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true }).select("-password");
  if (!updatedUser) throw new ApiError(404, "User not found");
  return updatedUser;
};

// Add kundli
exports.addKundli = async (userId, kundliData) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  user.kundlis.push(kundliData);
  await user.save();
  return user;
};


exports.getUserTransactions = async (userId) => {
  const transactions = await Transaction.find({ userId })
    .sort({ createdAt: -1 }); // latest first

  return transactions;
};
