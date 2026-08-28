const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const register = async (req, res) => {
  try {
    const { name, email, password, phone, city, skills, profilePicture, role } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    // A registrant may choose a volunteer or project-manager account. Admin
    // access is never available through public registration.
    const assignedRole = role === "manager" ? "manager" : "student";

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim() || "",
      city: city?.trim() || "",
      skills: Array.isArray(skills) ? skills : [],
      profilePicture: profilePicture?.trim() || "",
      role: assignedRole,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: user.toPublicJSON(),
        token,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ success: false, message });
    }
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toPublicJSON(),
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
};

const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: req.user.toPublicJSON(),
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching profile" });
  }
};

const updateMe = async (req, res) => {
  try {
    const { name, phone, city, bio, skills, profilePicture } = req.body;
    const user = req.user;
    if (name !== undefined) {
      if (!name?.trim()) return res.status(400).json({ success: false, message: "Name cannot be empty" });
      user.name = name.trim();
    }
    if (phone !== undefined) user.phone = String(phone).trim();
    if (city !== undefined) user.city = String(city).trim();
    if (bio !== undefined) user.bio = String(bio).trim();
    if (skills !== undefined) {
      if (!Array.isArray(skills)) return res.status(400).json({ success: false, message: "Skills must be an array" });
      user.skills = skills.map((skill) => String(skill).trim()).filter(Boolean);
    }
    if (profilePicture !== undefined) user.profilePicture = String(profilePicture).trim();
    await user.save();
    return res.status(200).json({ success: true, message: "Profile updated", data: { user: user.toPublicJSON() } });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: "Server error updating profile" });
  }
};

module.exports = { register, login, getMe, updateMe };
