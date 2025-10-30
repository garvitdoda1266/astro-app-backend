require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Astrologer = require("./models/Astrologer");

const seedData = async () => {
  await connectDB();

  // Clear previous data
  await User.deleteMany({});
  await Astrologer.deleteMany({});

  // Hash password
  const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };

  // Create Admin
  const admin = new User({
    name: "Admin",
    email: "admin@astro.com",
    phone: "9999999999",
    password: await hashPassword("admin123"),
    role: "admin",
  });
  await admin.save();

  // Create Astrologers
  const astrologers = [
    {
      name: "Astro Raj",
      email: "raj@astro.com",
      phone: "8888888888",
      password: await hashPassword("astro123"),
      expertise: "Love & Career",
      experience: 5,
      availability: [
        { date: new Date(), slots: ["10:00", "11:00", "12:00"] },
      ],
      isApproved: true,
    },
    {
      name: "Astro Priya",
      email: "priya@astro.com",
      phone: "7777777777",
      password: await hashPassword("astro123"),
      expertise: "Finance & Health",
      experience: 3,
      availability: [
        { date: new Date(), slots: ["14:00", "15:00", "16:00"] },
      ],
      isApproved: true,
    },
  ];

  for (let a of astrologers) {
    const astro = new Astrologer(a);
    await astro.save();
  }

  // Create Regular Users
  const users = [
    {
      name: "Garvit",
      email: "garvit@example.com",
      phone: "6666666666",
      password: await hashPassword("user123"),
    },
    {
      name: "John Doe",
      email: "john@example.com",
      phone: "5555555555",
      password: await hashPassword("user123"),
    },
  ];

  for (let u of users) {
    const user = new User(u);
    await user.save();
  }

  console.log("Database seeded successfully!");
  mongoose.connection.close();
};

seedData().catch((err) => {
  console.error(err);
  mongoose.connection.close();
});
