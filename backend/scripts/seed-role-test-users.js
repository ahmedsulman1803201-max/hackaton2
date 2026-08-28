require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const seedTestUsers = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const users = [
    { name: "Student Test", email: "student_role@test.impacthub.com", password: "test123", role: "student" },
    { name: "Manager Test", email: "manager_role@test.impacthub.com", password: "test123", role: "manager" },
    { name: "Admin Test", email: "admin_role@test.impacthub.com", password: "test123", role: "admin" },
  ];

  for (const data of users) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      existing.role = data.role;
      existing.password = data.password;
      await existing.save();
    } else {
      await User.create(data);
    }
  }

  console.log("Test users ready");
  await mongoose.disconnect();
};

seedTestUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
