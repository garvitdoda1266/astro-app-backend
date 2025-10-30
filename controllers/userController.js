const userService = require("../services/userService");
const ApiError = require("../utils/ApiError");

// Get logged-in user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const updated = await userService.updateUser(req.user._id, req.body);
    res.status(200).json({ message: "Profile updated successfully", user: updated });
  } catch (err) {
    next(err);
  }
};

// Add new kundli
exports.addKundli = async (req, res, next) => {
  try {
    const kundliData = req.body;

    // Basic validation
    if (!kundliData.fullName || !kundliData.gender || !kundliData.dateOfBirth || !kundliData.timeOfBirth || !kundliData.placeOfBirth) {
      throw new ApiError(400, "Missing required kundli details");
    }

    const updatedUser = await userService.addKundli(req.user.id, kundliData);
    res.status(201).json({ message: "Kundli added successfully", kundlis: updatedUser.kundlis });
  } catch (err) {
    next(err);
  }
};


exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user._id; // assuming you're using JWT protect middleware
    const transactions = await userService.getUserTransactions(userId);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
