const express = require("express");
const router = express.Router();
const { register, login, sendOtp, verifyOtp, logout } = require("../controllers/authController");
const validate = require("../middleware/validate");
const Joi = require("joi");

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// Routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp)
router.post("/logout", logout)

module.exports = router;
