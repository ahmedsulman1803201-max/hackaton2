const Project = require("../models/Project");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const parseFilePaths = (value) => {
  try { return Array.isArray(value) ? value : JSON.parse(value || "[]"); } catch { return []; }
};
const toProjectFiles = (files, relativePaths) => files.map((file, index) => ({
  filename: file.filename,
  originalName: relativePaths[index] || file.originalname,
  relativePath: relativePaths[index] || file.originalname,
  path: `/uploads/project-files/${file.filename}`,
  mimetype: file.mimetype,
  size: file.size,
}));

const createProject = async (req, res) => {
  try {
    const { title, description, category, skillsRequired, location, startDate, endDate, requiredVolunteers, projectImage } = req.body;

    // Parse skillsRequired if it's a string (from FormData)
    let parsedSkillsRequired = skillsRequired;
    if (typeof skillsRequired === 'string') {
      try {
        parsedSkillsRequired = JSON.parse(skillsRequired);
      } catch (e) {
        parsedSkillsRequired = [];
      }
    }

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

    // Handle file upload - use uploaded file path if available, otherwise use URL from body
    let imagePath = projectImage?.trim() || "";
    if (req.files?.projectImage?.[0]) {
      imagePath = `/uploads/project-images/${req.files.projectImage[0].filename}`;
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
      files: toProjectFiles(req.files?.projectFiles || [], parseFilePaths(req.body.projectFilePaths)),
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

const getProjects = async (req, res) => {
  try {
    const { status, category, createdBy, search, location, sort = "newest", page = 1, limit = 24 } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (category) {
      filter.category = category;
    }
    if (createdBy) {
      filter.createdBy = createdBy;
    }
    if (location?.trim()) filter.location = new RegExp(location.trim(), "i");
    if (search?.trim()) {
      const expression = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: expression }, { description: expression }, { skillsRequired: expression }];
    }

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(Number.parseInt(limit, 10) || 24, 1), 100);
    const sortMap = { oldest: { createdAt: 1 }, title: { title: 1 }, newest: { createdAt: -1 } };

    const projects = await Project.find(filter)
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort(sortMap[sort] || sortMap.newest)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    const total = await Project.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: {
        projects: projects.map((p) => p.toPublicJSON()),
        count: projects.length,
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching projects" });
  }
};

const getProjectById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({
      success: true,
      data: { project: project.toPublicJSON() },
    });
  } catch (error) {
    console.error("Get project error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching project" });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, category, skillsRequired, location, startDate, endDate, requiredVolunteers, projectImage, status } = req.body;

    // Parse skillsRequired if it's a string (from FormData)
    let parsedSkillsRequired = skillsRequired;
    if (typeof skillsRequired === 'string') {
      try {
        parsedSkillsRequired = JSON.parse(skillsRequired);
      } catch (e) {
        parsedSkillsRequired = [];
      }
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this project" });
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
    if (req.files?.projectImage?.[0]) {
      // Delete old image if it exists and is uploaded
      if (project.projectImage && project.projectImage.startsWith("/uploads/")) {
        const oldImagePath = path.join(__dirname, "..", project.projectImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      project.projectImage = `/uploads/project-images/${req.files.projectImage[0].filename}`;
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
    if (req.files?.projectFiles?.length) project.files.push(...toProjectFiles(req.files.projectFiles, parseFilePaths(req.body.projectFilePaths)));
    
    // Managers submit edits for moderation; only administrators can set a
    // project status directly.
    if (req.user.role === "admin" && status && ["pending", "approved", "active", "completed", "rejected"].includes(status)) project.status = status;
    else if (req.user.role === "manager" && project.status !== "pending") project.status = "pending";

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

    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this project" });
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

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
