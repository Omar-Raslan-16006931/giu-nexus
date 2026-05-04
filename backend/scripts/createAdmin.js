require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: "adminacc@test.com" });

    if (existing) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    const admin = await User.create({
      name: "Admin Name",
      email: "adminacc@test.com",
      password: "123456",
      role: "admin",
      status: "approved",
    });

    console.log("Admin created:", admin.email);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();