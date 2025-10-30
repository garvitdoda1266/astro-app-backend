const express = require("express");
const router = express.Router();
const { register, login, sendOtp, verifyOtp } = require("../controllers/authController");
const validate = require("../middleware/validate");
const Joi = require("joi");

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("user", "astrologer").optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp)

module.exports = router;
