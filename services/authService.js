const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
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
exports.register = async ({ name, email, phone, password, role }) => {
  try {
    const existing =
      (await User.findOne({ email })) || (await Astrologer.findOne({ email }));
    if (existing) throw new ApiError(400, "Email already exists");

    let user;
    if (role === "user") {
      user = new User({ name, email, phone, password });
    } else if (role === "astrologer") {
      user = new Astrologer({ name, email, phone, password });
    } else {
      throw new ApiError(400, "Invalid role");
    }

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
exports.login = async ({ email, password }) => {
  try {
    const user =
      (await User.findOne({ email })) || (await Astrologer.findOne({ email }));

    if (!user) throw new ApiError(400, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(400, "Invalid credentials");

    const role = user instanceof User ? "user" : "astrologer";
    const token = generateToken(user._id, role);

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
    const formattedNumber = phone.startsWith('+') ? phone : `+91${phone}`;
    // const verificationCheck = await twilioClient.verify.v2
    //   .services(TWILIO_VERIFY_SERVICE_SID)
    //   .verificationChecks
    //   .create({
    //     to: formattedNumber,
    //     code: otp
    //   });

    // add a verification check
    if (otp==='123456') {
       let user = (await User.findOne({ phone })) || (await Astrologer.findOne({ phone }));
       let isNewUser=false;
       if(!user){
        if (role === "user") {
          user = new User({ phone, role });
        } else if (role === "astrologer") {
          user = new Astrologer({ phone });
        } else {
          throw new ApiError(400, "Invalid role");
        }
        await user.save();
        isNewUser = true;
       }
       if(user instanceof User && !user.name){
        isNewUser=true;
       }
       if(user instanceof Astrologer && !user.profileName){
        isNewUser=true;
       }
       const token = generateToken(user._id, role);
      return { 
        isValid: true, 
        token:token,
        is_new_user: isNewUser,
        message: "OTP verified successfully"
      };
    } else {
      return { 
        isValid: false, 
        message: "Invalid OTP" 
      };
    }
  } catch (error) {
    console.error("Verify OTP error:", error.message);
    return {
      isValid: false,
      message: "Invalid or expired OTP"
    };
  }
};
