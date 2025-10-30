const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getUsers,
  blockUnblockUser,
  approveAstrologer
} = require("../controllers/adminController");

// User management
router.get("/users", protect, adminOnly, getUsers);
router.put("/users/:id/block", protect, adminOnly, blockUnblockUser);

// Astrologer management
router.put("/astrologers/:id/approve", protect, adminOnly, approveAstrologer);

module.exports = router;
