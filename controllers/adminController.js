const adminService = require("../services/adminService");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.blockUnblockUser = async (req, res, next) => {
  try {
    const isBlocked = await adminService.toggleUserBlock(req.params.id);
    res.json({ message: isBlocked ? "User blocked" : "User unblocked" });
  } catch (err) {
    next(err);
  }
};

exports.approveAstrologer = async (req, res, next) => {
  try {
    const astrologer = await adminService.approveAstrologer(req.params.id);
    res.json({ message: "Astrologer approved successfully", astrologer });
  } catch (err) {
    next(err);
  }
};