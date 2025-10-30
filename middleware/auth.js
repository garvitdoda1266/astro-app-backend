const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Astrologer = require("../models/Astrologer");
const ApiError = require("../utils/ApiError");

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next(new ApiError(401, "No token, authorization denied"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id) || await Astrologer.findById(decoded.id) || await Admin.findById(decoded.id);
    if (!req.user) return next(new ApiError(401, "User not found"));
    next();
  } catch (err) {
    next(new ApiError(401, "Token is invalid"));
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") return next(new ApiError(403, "Admin access only"));
  next();
};

const userOnly = (req, res, next) => {
  if (req.user.role !== "user") return next(new ApiError(403, "User access only"));
  if (req.user.isBlocked) return next(new ApiError(403, "Your account is blocked"));
  next();
};

const astrologerOnly = (req, res, next) => {
  if (req.user.role !== "astrologer") return next(new ApiError(403, "Astrologer access only"));
  if (!req.user.verified) return next(new ApiError(403, "Your account not approved yet"));
  next();
};

module.exports = { protect, adminOnly, userOnly, astrologerOnly };
