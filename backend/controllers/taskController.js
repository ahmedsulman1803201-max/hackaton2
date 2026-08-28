const Task = require("../models/Task");
const TaskSubmission = require("../models/TaskSubmission");
const VolunteerScore = require("../models/VolunteerScore");
const Project = require("../models/Project");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");

const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate, priority, maxScore, submissionRequirements } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Task title is required" });
    }
    if (!description?.trim()) {
      return res.status(400).json({ success: false, message: "Task description is required" });
    }
    if (!project) {
      return res.status(400).json({ success: false, message: "Project is required" });
    }
    if (!assignedTo) {
      return res.status(400).json({ success: false, message: "Assigned volunteer is required" });
    }
    if (!dueDate) {
      return res.status(400).json({ success: false, message: "Due date is required" });
    }

    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    if (req.user.role !== "admin" && projectExists.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to create tasks for this project" });
    }

    // Verify volunteer exists
    const volunteer = await User.findById(assignedTo);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: "Volunteer not found" });
    }
    if (volunteer.role !== "student") {
      return res.status(400).json({ success: false, message: "Can only assign tasks to students" });
    }
    if (!projectExists.members.some((member) => member.equals(volunteer._id))) {
      return res.status(400).json({ success: false, message: "Tasks can only be assigned to approved project members" });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      project,
      assignedTo,
      assignedBy: req.user._id,
      dueDate,
      priority: priority || "medium",
      maxScore: maxScore || 100,
      submissionRequirements: submissionRequirements || "",
    });

    // Populate task with references
    await task.populate("project", "title");
    await task.populate("assignedTo", "name email");
    await task.populate("assignedBy", "name email");

    await createNotification({
      recipient: assignedTo,
      type: "TASK_ASSIGNED",
      message: `You were assigned "${task.title}" on ${projectExists.title}`,
      relatedProject: projectExists._id,
      relatedTask: task._id,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: { task: task.toPublicJSON() },
    });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ success: false, message: "Server error creating task" });
  }
};

const getTasks = async (req, res) => {
  try {
    const { project, assignedTo, status, priority } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (req.user.role === "student") {
      filter.assignedTo = req.user._id;
    } else if (req.user.role === "manager") {
      const managedProjects = await Project.find({ createdBy: req.user._id }).select("_id");
      const managedIds = managedProjects.map((entry) => entry._id.toString());
      if (project) {
        if (!managedIds.includes(project.toString())) {
          return res.status(403).json({ success: false, message: "Not authorized to view tasks for this project" });
        }
      } else {
        filter.project = { $in: managedProjects.map((entry) => entry._id) };
      }
    }

    const tasks = await Task.find(filter)
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { tasks: tasks.map((task) => task.toPublicJSON()), count: tasks.length },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching tasks" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "title description")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Check permissions
    if (req.user.role === "student" && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this task" });
    }
    if (req.user.role === "manager") {
      const project = await Project.findById(task.project._id || task.project).select("createdBy");
      if (!project || project.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Not authorized to view this task" });
      }
    }

    return res.status(200).json({
      success: true,
      data: { task: task.toPublicJSON() },
    });
  } catch (error) {
    console.error("Get task error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching task" });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, maxScore, submissionRequirements, status } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (req.user.role === "student") {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Not authorized to update this task" });
      }
      if (Object.keys(req.body).some((key) => key !== "status")) {
        return res.status(403).json({ success: false, message: "Users can only update task status" });
      }
      if (!["pending", "in_progress"].includes(status)) {
        return res.status(400).json({ success: false, message: "Submit work through the submission workflow; students can only set pending or in progress" });
      }
    }

    if (req.user.role !== "student" && task.assignedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this task" });
    }

    const previousStatus = task.status;
    if (title?.trim()) task.title = title.trim();
    if (description?.trim()) task.description = description.trim();
    if (dueDate) task.dueDate = dueDate;
    if (priority && ["low", "medium", "high", "urgent"].includes(priority)) task.priority = priority;
    if (maxScore !== undefined && maxScore >= 0) task.maxScore = maxScore;
    if (submissionRequirements !== undefined) task.submissionRequirements = submissionRequirements;
    if (status && ["pending", "in_progress", "submitted", "completed", "overdue"].includes(status)) task.status = status;

    await task.save();

    await task.populate("project", "title");
    await task.populate("assignedTo", "name email");
    await task.populate("assignedBy", "name email");

    if (status && status !== previousStatus) {
      const projectTitle = task.project?.title || "a project";
      const recipient = req.user.role === "student" ? task.assignedBy?._id || task.assignedBy : task.assignedTo?._id || task.assignedTo;
      if (recipient && recipient.toString() !== req.user._id.toString()) {
        await createNotification({
          recipient,
          type: "TASK_STATUS_UPDATED",
          message: `"${task.title}" on ${projectTitle} is now ${status.replace("_", " ")}`,
          relatedProject: task.project?._id || task.project,
          relatedTask: task._id,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: { task: task.toPublicJSON() },
    });
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ success: false, message: "Server error updating task" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Check permissions
    if (req.user.role === "student") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this task" });
    }

    if (task.assignedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this task" });
    }

    // Delete associated submissions
    await TaskSubmission.deleteMany({ task: req.params.id });

    await Task.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ success: false, message: "Server error deleting task" });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
