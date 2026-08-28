require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const migrateRoles = async () => {
  try {
    await connectDB();
    const result = await User.collection.updateMany({ role: "user" }, { $set: { role: "student" } });
    console.log(`Migrated ${result.modifiedCount} user account(s) to the student role.`);
  } catch (error) {
    console.error("Role migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

migrateRoles();
