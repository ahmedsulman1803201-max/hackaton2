require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const email = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : null;

if (!email) {
  console.error("ADMIN_EMAIL is missing from backend/.env.");
  console.error("Add: ADMIN_EMAIL=your-email@example.com");
  process.exit(1);
}

const makeAdmin = async () => {
  try {
    await connectDB();
    const user = await User.findOneAndUpdate(
      { email },
      { role: "admin" },
      { new: true }
    );

    if (user) {
      console.log(`Admin access enabled for ${user.email}.`);
    } else {
      console.log(`No account exists yet for ${email}. Sign up with this email, then run npm run make-admin again if needed.`);
    }
  } catch (error) {
    console.error("Could not configure the admin account:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

makeAdmin();
