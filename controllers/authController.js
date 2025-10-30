const authService = require("../services/authService");

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body)
    res.status(201).json({
      message: "Registered successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber || !/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid mobile number format' });
    }

    const success = await authService.sendOtpService(phoneNumber);
    if (success) {
      res.status(200).json({ message: 'OTP sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send OTP' });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp, role } = req.body;
    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: "Phone number and OTP required" });
    }

    const {isValid,token,is_new_user} = await authService.verifyOtpService(phoneNumber, otp, role);

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    res.status(200).json({
      message: 'Login successful',
      token,
      is_new_user: is_new_user
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "OTP verification failed" });
  }
};


exports.logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return success as token validation is stateless
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};