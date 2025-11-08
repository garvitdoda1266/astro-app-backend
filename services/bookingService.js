const Astrologer = require("../models/Astrologer");
const Booking = require("../models/Booking");

// 🟩 Create booking
exports.createBooking = async (userId, astrologerId, date, type) => {
  const astrologer = await Astrologer.findById(astrologerId);
  if (!astrologer) throw new Error("Astrologer not found");

  const bookingDate = new Date(date);
  const now = new Date();

  // Check if booking time is in the future
  if (bookingDate <= now) {
    throw new Error("Booking date and time must be in the future");
  }

  // Check if the day is part of astrologer's working days
  if (!astrologer.workingDays.includes(bookingDate.getDay())) {
    throw new Error("Selected slot is outside astrologer's working days");
  }

  // Check if slot is already booked
  const existing = await Booking.findOne({
    astrologerId,
    date,
    type,
    status: { $nin: ["cancelled", "completed"] }
  });
  if (existing) {
    throw new Error("This slot is already booked");
  }

  // Create new booking
  const booking = await Booking.create({
    user:userId,
    astrologerId,
    date,
    type
  });

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

  const bookingDate = new Date(targetDate);
  const now = new Date();

  // Check if booking time is in the future
  if (bookingDate <= now) {
    throw new Error("Booking date and time must be in the future");
  }

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
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));

  // Build base filters
  const baseFilter = { astrologerId };

  // 🟩 UPCOMING: bookings today or later
  const upcomingFilter = {
    ...baseFilter,
    status: { $in: ["pending", "confirmed"] },
    date: {
      $gte: startDate ? new Date(startDate) : todayStart,
      ...(endDate ? { $lte: new Date(endDate) } : {})
    }
  };

  // 🟥 PAST: bookings before today
  const pastFilter = {
    ...baseFilter,
    date: {
      $lt: startDate ? new Date(startDate) : todayStart,
      ...(endDate ? { $lte: new Date(endDate) } : {})
    }
  };

  const upcoming = await Booking.find(upcomingFilter)
    .populate("user", "name")
    .sort({ date: 1 });

  const past = await Booking.find(pastFilter)
    .populate("user", "name")
    .sort({ date: -1 });

  return { upcoming, past };
};



