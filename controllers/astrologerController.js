const astrologerService = require("../services/astrologerService");

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await astrologerService.getProfile(req.user._id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

exports.createProfile = async (req, res, next) => {
  try {
    const astrologer = await astrologerService.createAstrologerProfile(req.body);
    res.status(201).json({
      success: true,
      message: "Astrologer profile created successfully",
      data: astrologer,
    });
  } catch (error) {
    console.error("❌ Error creating astrologer:", error);
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updated = await astrologerService.updateProfile(req.user._id, req.body);
    res.json({ message: "Profile updated", astrologer: updated });
  } catch (err) {
    next(err);
  }
};

// GET /api/astrologers
exports.getAstrologers = async (req, res) => {
  try {
    const filters = {
      languages: req.query.languages ? req.query.languages.split(",") : [],
      expertise: req.query.expertise ? req.query.expertise.split(",") : [],
      gender: req.query.gender ? req.query.gender : null,
      search: req.query.search ? req.query.search : null,
    };

    const sortOption = req.query.sort || null; // "rating", "feeAsc", "feeDesc", "relevance"

    const astrologers = await astrologerService.getAstrologers(filters, sortOption);

    res.status(200).json({ success: true, count: astrologers.length, astrologers });
  } catch (err) {
    console.error("Error fetching astrologers:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const { astrologerId, rating, reviewText } = req.body;
    const userId = req.user._id;

    //hey 
    const review = await astrologerService.addReview(userId, astrologerId, rating, reviewText);
    res.status(201).json({ message: "Review added successfully", review });
  } catch (err) {
    next(err);
  }
};

exports.getAstrologerReviews = async (req, res, next) => {
  try {
    const astrologerId = req.params;
    const reviews = await astrologerService.getAstrologerReviews(astrologerId);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
