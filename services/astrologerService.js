const Astrologer = require("../models/Astrologer");
const Booking = require("../models/Booking");
const ApiError = require("../utils/ApiError");
const Review = require("../models/AstrologerReview");

exports.createAstrologerProfile = async (data) => {
  const requiredFields = [
    "profileName",
    "phone",
    "displayImage",
    "aboutMe",
    "experience",
    "skills",
    "category",
    "languagesKnown",
    "workingDays",
    "consultationFee",
    "idProofFrontImage",
    "idProofBackImage",
    "addressProofFrontImage",
    "addressProofBackImage",
  ];

  // ✅ Validate all required fields
  for (const field of requiredFields) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      (Array.isArray(data[field]) && data[field].length === 0) ||
      (typeof data[field] === "string" && data[field].trim() === "")
    ) {
      throw new ApiError(400, `Missing or empty required field: ${field}`);
    }
  }

  // ✅ Check if astrologer exists
  const astrologer = await Astrologer.findOne({ phone: data.phone });
  if (!astrologer) {
    throw new ApiError(404, "Astrologer not found. Please register first.");
  }

  // ✅ Update all profile fields
  astrologer.profileName = data.profileName;
  astrologer.displayImage = data.displayImage;
  astrologer.aboutMe = data.aboutMe;
  astrologer.experience = data.experience;
  astrologer.skills = data.skills;
  astrologer.category = data.category;
  astrologer.subCategory = data.subCategory;
  astrologer.languagesKnown = data.languagesKnown;
  astrologer.workingDays = data.workingDays;
  astrologer.consultationFee = data.consultationFee;

  astrologer.idProofFrontImage = data.idProofFrontImage;
  astrologer.idProofBackImage = data.idProofBackImage;
  astrologer.addressProofFrontImage = data.addressProofFrontImage;
  astrologer.addressProofBackImage = data.addressProofBackImage;

  // Save updates
  await astrologer.save();

  return astrologer;
};


exports.getProfile = async (astrologerId) => {
  const astrologer = await Astrologer.findById(astrologerId);
  if (!astrologer) throw new ApiError(404, "Astrologer not found");
  return astrologer;
};

exports.updateProfile = async (astrologerId, updateData) => {
  const astrologer = await Astrologer.findById(astrologerId);
  if (!astrologer) throw new ApiError(404, "Astrologer not found");

  const allowedFields = ["profileName","displayImage","aboutMe","experience","skills","category","subCategory","languagesKnown","walletBalance","averageRating","workingDays","consultationFee", "totalReviews"];
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) astrologer[field] = updateData[field];
  });

  await astrologer.save();
  return astrologer;
};


exports.getAstrologers = async (filters, sortOption) => {
  const query = {};

if (filters.search && filters.search.trim().length > 0) {
  const regex = new RegExp(filters.search.trim(), "i"); // case-insensitive search
  query.$or = [
    { name: regex },
    { expertise: { $elemMatch: { $regex: regex } } } // match any element in expertise array
  ];
}
  // Filter: Languages (any match)
  if (filters.languages.length > 0) {
    query.languagesKnown = { $in: filters.languages };
  }

  // Filter: Expertise (any match)
  if (filters.expertise.length > 0) {
    query.expertise = { $in: filters.expertise };
  }

  // Filter: Gender (optional)
  if (filters.gender) {
    query.gender = filters.gender;
  }

  // Build sort object
  let sort = {};
  switch (sortOption) {
    case "rating":
      sort = { rating: -1 }; // highest first
      break;
    case "feeAsc":
      sort = { consultationFee: 1 }; // lowest first
      break;
    case "feeDesc":
      sort = { consultationFee: -1 }; // highest first
      break;
    case "relevance":
    default:
      sort = {}; // default relevance (can be based on matching filters count or createdAt)
  }

  // Fetch astrologers from DB
  const astrologers = await Astrologer.find(query).sort(sort);

  return astrologers;
};

exports.addReview = async (userId, astrologerId, rating, reviewText) => {
  const existing = await Review.findOne({ userId, astrologerId });
  if (existing) throw new ApiError(400, "You already reviewed this astrologer.");

  const review = await Review.create({ userId, astrologerId, rating, reviewText });

  // Recalculate average rating
  const stats = await Review.aggregate([
    { $match: { astrologerId: review.astrologerId } },
    {
      $group: {
        _id: "$astrologerId",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  //check if booking is completed or not

  if (stats.length > 0) {
    await Astrologer.findByIdAndUpdate(astrologerId, {
      averageRating: stats[0].avgRating,
      totalReviews: stats[0].count,
    });
  }

  return review;
};

exports.getAstrologerReviews = async (astrologerId) => {
  return await Review.find({ astrologerId })
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
};
