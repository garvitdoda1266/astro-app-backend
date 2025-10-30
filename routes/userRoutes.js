const express = require("express");
const router = express.Router();
const { protect, userOnly } = require("../middleware/auth");
const userController = require("../controllers/userController");

// User profile routes
router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, userController.updateProfile);

// Kundli management
router.post("/kundli", protect, userOnly, userController.addKundli);

router.get('/transactions', protect, userController.getUserTransactions);

module.exports = router;
