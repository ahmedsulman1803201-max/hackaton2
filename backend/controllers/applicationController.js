const Application = require("../models/Application");
const Project = require("../models/Project");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");
const { notifyAdmins } = createNotification;

const createApplication = async (req, res) => {
  try {
    const { project, message } = req.body;

    if (!project) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    // Verify user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({ success: false, message: "Only students can apply to projects" });
    }

    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!["approved", "active"].includes(projectExists.status)) {
      return res.status(400).json({ success: false, message: "This project is not currently accepting volunteers" });
    }
    if (projectExists.members.length >= projectExists.requiredVolunteers) {
      return res.status(400).json({ success: false, message: "This project has no volunteer places remaining" });
    }

    // The database has a unique student/project index. Keep this check here as
    // well to return a helpful response before attempting an insert.
    const existingApplication = await Application.findOne({
      student: req.user._id,
      project: project,
    });

    if (existingApplication) {
      return res.status(409).json({ success: false, message: "Already applied to this project" });
    }

    // Create application
    const application = await Application.create({
      student: req.user._id,
      project: project,
      message: message?.trim() || "",
      status: "pending",
      appliedAt: new Date(),
    });

    await createNotification({
      recipient: projectExists.createdBy,
      type: "APPLICATION_RECEIVED",
      message: `New application received for ${projectExists.title}`,
      relatedProject: projectExists._id,
      relatedApplication: application._id,
    });
    await notifyAdmins({
      type: "APPLICATION_RECEIVED",
      message: `New application received for ${projectExists.title}`,
      relatedProject: projectExists._id,
      relatedApplication: application._id,
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: { application: application.toPublicJSON() },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Already applied to this project" });
    }
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ success: false, message });
    }
    console.error("Create application error:", error);
    return res.status(500).json({ success: false, message: "Server error during application creation" });
  }
};

const getMyApplications = async (req, res) => {
  try {
    // Verify user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({ success: false, message: "Only students can view their applications" });
    }

    const applications = await Application.find({ student: req.user._id })
      .populate("project", "title description category status createdBy")
      .populate("student", "name email")
      .populate("reviewedBy", "name email")
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        applications: applications.map((a) => a.toPublicJSON()),
        count: applications.length,
      },
    });
  } catch (error) {
    console.error("Get my applications error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching applications" });
  }
};

const getManagedApplications = async (req, res) => {
  try {
    if (!["manager", "admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only managers can view applications" });
    }

    const filter = {};
    if (req.user.role !== "admin") {
      const projects = await Project.find({ createdBy: req.user._id }).select("_id");
      filter.project = { $in: projects.map((project) => project._id) };
    }

    const applications = await Application.find(filter)
      .populate("student", "name email skills profilePicture")
      .populate("project", "title description category status createdBy")
      .populate("reviewedBy", "name email")
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        applications: applications.map((application) => application.toPublicJSON()),
        count: applications.length,
      },
    });
  } catch (error) {
    console.error("Get managed applications error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching applications" });
  }
};

const getProjectApplications = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify user is a manager
    if (!['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only managers can view project applications" });
    }

    // Verify project exists and belongs to this manager
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (req.user.role !== "admin" && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view applications for this project" });
    }

    const applications = await Application.find({ project: projectId })
      .populate("student", "name email skills")
      .populate("project", "title description category")
      .populate("reviewedBy", "name email")
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        applications: applications.map((a) => a.toPublicJSON()),
        count: applications.length,
      },
    });
  } catch (error) {
    console.error("Get project applications error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching project applications" });
  }
};

const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user is a manager
    if (!['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only managers can approve applications" });
    }

    const application = await Application.findById(id).populate("project");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Verify the project belongs to this manager
    if (req.user.role !== "admin" && application.project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to approve applications for this project" });
    }

    if (application.status !== "pending") {
      return res.status(400).json({ success: false, message: `Application has already been ${application.status}` });
    }

    if (application.project.members.length >= application.project.requiredVolunteers) {
      return res.status(400).json({ success: false, message: "This project has no volunteer places remaining" });
    }

    // Update application status
    application.status = "approved";
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    await application.save();

    // Add student to project members (avoid duplicates)
    const project = await Project.findById(application.project._id);
    if (!project.members.some((member) => member.equals(application.student))) {
      project.members.push(application.student);
      await project.save();
    }

    await createNotification({
      recipient: application.student,
      type: "APPLICATION_APPROVED",
      message: `Your application for ${application.project.title} was approved`,
      relatedProject: application.project._id,
      relatedApplication: application._id,
    });

    return res.status(200).json({
      success: true,
      message: "Application approved successfully",
      data: { application: application.toPublicJSON() },
    });
  } catch (error) {
    console.error("Approve application error:", error);
    return res.status(500).json({ success: false, message: "Server error during application approval" });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user is a manager
    if (!['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only managers can reject applications" });
    }

    const application = await Application.findById(id).populate("project");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Verify the project belongs to this manager
    if (req.user.role !== "admin" && application.project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to reject applications for this project" });
    }

    if (application.status !== "pending") {
      return res.status(400).json({ success: false, message: `Application has already been ${application.status}` });
    }

    // Update application status
    application.status = "rejected";
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    await application.save();

    await createNotification({
      recipient: application.student,
      type: "APPLICATION_REJECTED",
      message: `Your application for ${application.project.title} was rejected`,
      relatedProject: application.project._id,
      relatedApplication: application._id,
    });

    return res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      data: { application: application.toPublicJSON() },
    });
  } catch (error) {
    console.error("Reject application error:", error);
    return res.status(500).json({ success: false, message: "Server error during application rejection" });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getManagedApplications,
  getProjectApplications,
  approveApplication,
  rejectApplication,
};
