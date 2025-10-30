const Astrologer = require("../models/Astrologer");
const Booking = require("../models/Booking");

// 🟩 Create booking
exports.createBooking = async (userId, astrologerId, date, type) => {
  const astrologer = await Astrologer.findById(astrologerId);
  if (!astrologer) throw new Error("Astrologer not found");

  if (!astrologer.workingDays.includes(new Date(date).getDay())) throw new Error("Selected slot is outside astrologer's working hours");

  const existing = await Booking.findOne({ astrologerId, date, type, status: { $nin: ["cancelled","completed"] } });
  if (existing) throw new Error("This slot is already booked");

  const booking = await Booking.create({ userId, astrologerId, date, type });

  return booking;
};

// 🟨 Update booking status — only astrologers can confirm or reject
exports.updateBookingStatus = async (bookingId, astrologerId, status) => {
  const allowedStatuses = ["accepted", "rejected","completed"];
  if (!allowedStatuses.includes(status))
    throw new Error("Booking status change not allowed");

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  if (booking.astrologerId.toString() !== astrologerId.toString())
    throw new Error("Not authorized to update this booking");

  booking.status = status;
  await booking.save();
  return booking;
};


// Generate 30-min slots between startHour and endHour for a given date
function generateSlotsForDate(baseDate, startHour, endHour, slotMinutes) {
  const slots = [];
  const start = new Date(baseDate);
  start.setUTCHours(startHour, 0, 0, 0);

  const end = new Date(baseDate);
  end.setUTCHours(endHour, 0, 0, 0);

  while (start < end) {
    const slotStart = new Date(start);
    slots.push(slotStart);
    start.setMinutes(start.getMinutes() + slotMinutes);
  }

  return slots;
}

exports.getAvailableSlots = async (astrologerId, targetDate) => {
  const astrologer = await Astrologer.findById(astrologerId);
  if (!astrologer) throw new Error("Astrologer not found");

  // Check if astrologer works that day
  const dayOfWeek = new Date(targetDate).getDay();
  if (!astrologer.workingDays.includes(dayOfWeek)) {
    throw new Error("Date is outside astrologer's working days");
  }

  // Define day start and end (UTC)
  const dayStart = new Date(targetDate);
  dayStart.setUTCHours(0, 0, 0, 0);

  const dayEnd = new Date(targetDate);
  dayEnd.setUTCHours(23, 59, 59, 999);

  console.log(astrologerId, dayStart, dayEnd);

  // Fetch all bookings for that astrologer on that date
  const bookings = await Booking.find({
    astrologerId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ["pending", "accepted"] },
  });

  // Extract booked slot start times as timestamps for easy comparison
  const bookedSlotTimes = bookings.map((b) => new Date(b.date).getTime());

  // Generate all slots between 9 AM - 5 PM
  const allSlots = generateSlotsForDate(targetDate, 9, 17, 30);

  const targetTimestamp = new Date(targetDate).getTime();

  // Create slot objects with isOccupied flag
  const result = allSlots
    .filter((slot) => slot.getTime() > targetTimestamp) // only future slots
    .map((slot) => ({
      slot: slot,
      isOccupied: bookedSlotTimes.includes(slot.getTime()),
    }));

  return result;
};

// Rest unchanged...
exports.getUserBookings = async (userId) => {
  return Booking.find({ userId })
    .populate("astrologerId", "profileName displayImage")
    .sort({ date: -1 });
};

exports.getAstrologerBookings = async (astrologerId, startDate, endDate) => {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // Build date filters dynamically
  const dateFilter = {};
  if (startDate) dateFilter.$gte = startDate;
  if (endDate) dateFilter.$lte = endDate;

  // Upcoming bookings: today or later (and optional range)
  const upcomingFilter = {
    astrologerId,
    status: { $in: ["pending", "confirmed"] },
    ...(Object.keys(dateFilter).length
      ? { date: dateFilter }
      : { date: { $gte: todayStr } })
  };

  // Past bookings: before today (and optional range)
  const pastFilter = {
    astrologerId,
    ...(Object.keys(dateFilter).length
      ? { date: dateFilter }
      : { date: { $lt: todayStr } })
  };

  const upcoming = await Booking.find(upcomingFilter)
    .populate("userId", "name email")
    .sort({ date: 1 });

  const past = await Booking.find(pastFilter)
    .populate("userId", "name email")
    .sort({ date: -1 });

  return { upcoming, past };
};

