const bookingService = require("../services/bookingService");

exports.createBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { astrologerId, date, type } = req.body;
    const booking = await bookingService.createBooking(userId, astrologerId, date, type);

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const astrologerId = req.user._id;
    const { id } = req.params;
    const { status } = req.body;

    const result = await bookingService.updateBookingStatus(id, astrologerId, status);

    res.status(200).json({
      success: true,
      booking: result.booking,
      availableSlots: result.availableSlots || []
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { astrologerId } = req.params;
    const { date } = req.query;

    if (!astrologerId || !date) {
      return res.status(400).json({ message: "astrologerId and date are required" });
    }
    const slots = await bookingService.getAvailableSlots(astrologerId, date);

    res.status(200).json({ success: true, availableSlots: slots });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await bookingService.getUserBookings(userId);
    res.status(200).json({ success: true, bookings });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAstrologerBookings = async (req, res) => {
  try {
    const astrologerId = req.user._id;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const bookings = await bookingService.getAstrologerBookings(astrologerId, startDate, endDate);
    res.status(200).json({ success: true, bookings });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
