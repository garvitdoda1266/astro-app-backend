const express = require("express");
const router = express.Router();
const { protect, userOnly, astrologerOnly } = require("../middleware/auth");
const { createBooking, getUserBookings, getAstrologerBookings, updateBookingStatus, getAvailableSlots } = require("../controllers/bookingController");
// USER: Book a slot
router.post("/", protect, userOnly, createBooking);

// USER: View all their bookings
router.get("/user", protect, getUserBookings);

// ASTROLOGER: View their upcoming & past bookings
router.get("/astrologer", protect, getAstrologerBookings);  // check for authorize roles as admin and astrologer, both can do this

// ASTROLOGER: Update (confirm/reject) booking
router.put("/:id/status", protect, astrologerOnly, updateBookingStatus);  // check for authorize roles as admin and astrologer, both can do this

// PUBLIC/USER: Get available slots for an astrologer for given date
router.get("/available-slots/:astrologerId", protect, userOnly, getAvailableSlots);

module.exports = router;
