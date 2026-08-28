const User = require("../models/User");
const Project = require("../models/Project");
const Application = require("../models/Application");
const Task = require("../models/Task");
const VolunteerScore = require("../models/VolunteerScore");
const createNotification = require("../utils/createNotification");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalManagers, totalProjects, pendingProjects, approvedProjects, activeProjects, completedProjects, totalApplications, pendingApplications, totalTasks, completedTasks, contribution] = await Promise.all([
      User.countDocuments(), User.countDocuments({ role: "student" }), User.countDocuments({ role: "manager" }),
      Project.countDocuments(), Project.countDocuments({ status: "pending" }), Project.countDocuments({ status: "approved" }),
      Project.countDocuments({ status: "active" }), Project.countDocuments({ status: "completed" }),
      Application.countDocuments(), Application.countDocuments({ status: "pending" }), Task.countDocuments(), Task.countDocuments({ status: "completed" }),
      VolunteerScore.aggregate([{ $group: { _id: null, total: { $sum: "$totalScore" } } }]),
    ]);

    return res.status(200).json({ success: true, data: { stats: {
      totalUsers, totalStudents, totalManagers, totalVolunteers: totalStudents, totalProjects, pendingProjects, approvedProjects, activeProjects, completedProjects, totalApplications, pendingApplications, totalTasks, completedTasks,
      volunteerContributions: contribution[0]?.total || 0,
    } } });
  } catch (error) {
    console.error("Get admin dashboard error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching dashboard statistics" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: { users: users.map((user) => user.toPublicJSON()), count: users.length } });
  } catch (error) {
    console.error("Get admin users error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching users" });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot remove your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, message: "User removed successfully" });
  } catch (error) {
    console.error("Delete admin user error:", error);
    return res.status(500).json({ success: false, message: "Server error removing user" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, city, skills, role } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim() || "",
      city: city?.trim() || "",
      skills: Array.isArray(skills) ? skills : [],
      role: role || "student",
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user: user.toPublicJSON() },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ success: false, message: "Server error creating user" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, phone, city, skills, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (req.params.id === req.user._id.toString() && role && role !== user.role) {
      return res.status(400).json({ success: false, message: "You cannot change your own role" });
    }

    if (name?.trim()) user.name = name.trim();
    if (email?.trim()) {
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }
      user.email = email.toLowerCase().trim();
    }
    if (phone !== undefined) user.phone = phone?.trim() || "";
    if (city !== undefined) user.city = city?.trim() || "";
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : [];
    if (role && ["student", "manager", "admin"].includes(role)) user.role = role;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: { user: user.toPublicJSON() },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ success: false, message: "Server error updating user" });
  }
};

const getVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: "student" }).sort({ createdAt: -1 });
    return res.status(200).json({ 
      success: true, 
      data: { volunteers: volunteers.map((user) => user.toPublicJSON()), count: volunteers.length } 
    });
  } catch (error) {
    console.error("Get volunteers error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching volunteers" });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("createdBy", "name email").populate("members", "name email").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: { projects: projects.map((project) => project.toPublicJSON()), count: projects.length } });
  } catch (error) {
    console.error("Get admin projects error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching projects" });
  }
};

const setProjectStatus = (status, message) => async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    project.status = status;
    project.rejectionReason = status === "rejected" ? String(req.body.reason || "The project needs changes before approval.").trim().slice(0, 500) : "";
    await project.save();
    await createNotification({
      recipient: project.createdBy,
      type: status === "approved" ? "PROJECT_APPROVED" : "PROJECT_REJECTED",
      message: status === "approved" ? `Your project \"${project.title}\" was approved` : `Your project \"${project.title}\" was not approved: ${project.rejectionReason}`,
      relatedProject: project._id,
    });
    return res.status(200).json({ success: true, message, data: { project: project.toPublicJSON() } });
  } catch (error) {
    console.error(`Admin project ${status} error:`, error);
    return res.status(500).json({ success: false, message: `Server error ${status === "approved" ? "approving" : "rejecting"} project` });
  }
};

const approveProject = setProjectStatus("approved", "Project approved successfully");
const rejectProject = setProjectStatus("rejected", "Project rejected successfully");

const createProject = async (req, res) => {
  try {
    const { title, description, category, skillsRequired, location, startDate, endDate, requiredVolunteers, projectImage } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Project title is required" });
    }
    if (!description?.trim()) {
      return res.status(400).json({ success: false, message: "Project description is required" });
    }
    if (!category?.trim()) {
      return res.status(400).json({ success: false, message: "Project category is required" });
    }
    if (!startDate) {
      return res.status(400).json({ success: false, message: "Project start date is required" });
    }
    if (!endDate) {
      return res.status(400).json({ success: false, message: "Project end date is required" });
    }
    if (!requiredVolunteers || requiredVolunteers < 1) {
      return res.status(400).json({ success: false, message: "Required volunteers must be at least 1" });
    }

    // Parse skillsRequired if it's a string (from FormData)
    let parsedSkillsRequired = skillsRequired;
    if (typeof skillsRequired === 'string') {
      try {
        parsedSkillsRequired = JSON.parse(skillsRequired);
      } catch (e) {
        parsedSkillsRequired = [];
      }
    }

    // Handle file upload - use uploaded file path if available, otherwise use URL from body
    let imagePath = projectImage?.trim() || "";
    if (req.file) {
      imagePath = `/uploads/project-images/${req.file.filename}`;
    }

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      skillsRequired: Array.isArray(parsedSkillsRequired) ? parsedSkillsRequired : [],
      location: location?.trim() || "",
      startDate,
      endDate,
      requiredVolunteers,
      projectImage: imagePath,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: { project: project.toPublicJSON() },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ success: false, message });
    }
    console.error("Create project error:", error);
    return res.status(500).json({ success: false, message: "Server error during project creation" });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, category, skillsRequired, location, startDate, endDate, requiredVolunteers, projectImage, status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Parse skillsRequired if it's a string (from FormData)
    let parsedSkillsRequired = skillsRequired;
    if (typeof skillsRequired === 'string') {
      try {
        parsedSkillsRequired = JSON.parse(skillsRequired);
      } catch (e) {
        parsedSkillsRequired = [];
      }
    }

    if (title?.trim()) project.title = title.trim();
    if (description?.trim()) project.description = description.trim();
    if (category?.trim()) project.category = category.trim();
    if (skillsRequired !== undefined) project.skillsRequired = Array.isArray(parsedSkillsRequired) ? parsedSkillsRequired : [];
    if (location !== undefined) project.location = location?.trim() || "";
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (requiredVolunteers && requiredVolunteers >= 1) project.requiredVolunteers = requiredVolunteers;
    
    // Handle file upload - use uploaded file path if available, otherwise use URL from body
    if (req.file) {
      // Delete old image if it exists and is uploaded
      if (project.projectImage && project.projectImage.startsWith("/uploads/")) {
        const oldImagePath = path.join(__dirname, "..", project.projectImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      project.projectImage = `/uploads/project-images/${req.file.filename}`;
    } else if (projectImage !== undefined) {
      // If explicitly set to empty string, clear the image
      if (projectImage === "") {
        // Delete old image if it exists and is uploaded
        if (project.projectImage && project.projectImage.startsWith("/uploads/")) {
          const oldImagePath = path.join(__dirname, "..", project.projectImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        project.projectImage = "";
      } else {
        project.projectImage = projectImage?.trim() || "";
      }
    }
    
    if (status && ["pending", "approved", "active", "completed", "rejected"].includes(status)) project.status = status;

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: { project: project.toPublicJSON() },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ success: false, message });
    }
    console.error("Update project error:", error);
    return res.status(500).json({ success: false, message: "Server error during project update" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Delete associated image file if it exists and is uploaded
    if (project.projectImage && project.projectImage.startsWith("/uploads/")) {
      const imagePath = path.join(__dirname, "..", project.projectImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Project.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({ success: false, message: "Server error during project deletion" });
  }
};

const getApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("student", "name email phone city skills profilePicture")
      .populate("project", "title description category status createdBy")
      .populate("reviewedBy", "name email")
      .sort({ appliedAt: -1 });
    return res.status(200).json({ success: true, data: {
      applications: applications.map((application) => application.toPublicJSON()), count: applications.length,
    } });
  } catch (error) {
    console.error("Get admin applications error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching applications" });
  }
};

module.exports = { 
  getDashboard, 
  getUsers, 
  deleteUser, 
  createUser, 
  updateUser, 
  getVolunteers,
  getProjects, 
  approveProject, 
  rejectProject, 
  createProject,
  updateProject,
  deleteProject,
  getApplications 
};
