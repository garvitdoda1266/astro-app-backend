const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Astrologer = require("../models/Astrologer");
const ApiError = require("../utils/ApiError");
const twilio = require("twilio");
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// 🔹 Helper: Generate JWT token
const generateToken = (id, role) => {
  try {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
  } catch (err) {
    console.error("JWT generation failed:", err);
    throw new ApiError(500, "Internal server error while generating token");
  }
};

// 🔹 Register user or astrologer
exports.register = async ({ username, password}) => {
  try {
    const role="admin";
    if(!username || !password){
      throw new ApiError(400, "Username or Password is missing");
    }
    const existing = await Admin.findOne({ username });
    if (existing) throw new ApiError(400, "Username already exists for an admin");

    let user=new Admin({ username, password });
    await user.save();

    const token = generateToken(user._id, role);
    return { token, user };
  } catch (err) {
    console.error("Error in register:", err);
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, "Failed to register user");
  }
};

// 🔹 Login logic
exports.login = async ({ username, password }) => {
  try {
    if(!username || !password){
      throw new ApiError(400, "Username or Password is missing");
    }
    const user =await Admin.findOne({ username });

    if (!user) throw new ApiError(400, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(400, "Invalid credentials");

    const token = generateToken(user._id, "admin");

    return { token, user };
  } catch (err) {
    console.error("Error in login:", err);
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, "Failed to login");
  }
};

// 🔹 Send OTP via Twilio
exports.sendOtpService = async (mobileNumber) => {
  try {
    const formattedNumber = mobileNumber.startsWith('+') ? mobileNumber : `+91${mobileNumber}`;
    
    const verification = await twilioClient.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID)
      .verifications
      .create({
        to: formattedNumber,
        channel: 'sms'
      });

    return { 
      success: true, 
      message: "OTP sent successfully",
      sid: verification.sid 
    };
  } catch (error) {
    console.error("Send OTP error:", error.message);
    return {    
      success: false, 
      message: "Failed to send OTP"
    };
  }
};

// 🔹 Verify OTP
exports.verifyOtpService = async (phone, otp, role) => {
  try {
    // Normalize phone (remove +91 or any prefix)
    const normalizedPhone = phone.replace(/^\+91/, "");

    // Use normalized phone for DB search and storage
    if (otp === "123456") {
      let user =
        (await User.findOne({ phone: normalizedPhone })) ||
        (await Astrologer.findOne({ phone: normalizedPhone }));

      let isNewUser = false;

      // Create new user if not exists
      if (!user) {
        if (role === "user") {
          user = new User({ phone: normalizedPhone, role });
        } else if (role === "astrologer") {
          user = new Astrologer({ phone: normalizedPhone });
        } else {
          throw new ApiError(400, "Invalid role");
        }
        await user.save();
        isNewUser = true;
      }

      // Check if profile is incomplete → treat as new user
      if (user instanceof User && !user.name) {
        isNewUser = true;
      }
      if (user instanceof Astrologer && !user.profileName) {
        isNewUser = true;
      }

      const token = generateToken(user._id, role);

      return {
        isValid: true,
        token,
        is_new_user: isNewUser,
        message: "OTP verified successfully",
      };
    } else {
      return {
        isValid: false,
        message: "Invalid OTP",
      };
    }
  } catch (error) {
    console.error("Verify OTP error:", error.message);
    return {
      isValid: false,
      message: "Invalid or expired OTP",
    };
  }
};

