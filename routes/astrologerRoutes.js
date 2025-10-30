const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { 
  getProfile, 
  updateProfile,
  getAstrologers,
  addReview,
  getAstrologerReviews,
  createProfile
} = require("../controllers/astrologerController");
// Profile routes
router.get("/me", protect, getProfile);
router.put("/update", protect, updateProfile);
router.post("/create", protect, createProfile);

// get astrologers with filters
router.get("/", protect, getAstrologers);

router.post("/", protect, addReview);
router.get("/:astrologerId", getAstrologerReviews);


module.exports = router;
