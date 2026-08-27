const TaskSubmission = require("../models/TaskSubmission");
const Task = require("../models/Task");
const VolunteerScore = require("../models/VolunteerScore");
const fs = require("fs");
const path = require("path");
const Project = require("../models/Project");
const createNotification = require("../utils/createNotification");

const canManageTask = async (user, task) => {
  if (user.role === "admin") return true;
  const project = await Project.findById(task.project?._id || task.project).select("createdBy");
  return Boolean(project && project.createdBy.toString() === user._id.toString());
};

const createSubmission = async (req, res) => {
  try {
    const { task, description } = req.body;

    if (!task) {
      return res.status(400).json({ success: false, message: "Task is required" });
    }

    // Verify task exists
    const taskExists = await Task.findById(task);
    if (!taskExists) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Check if volunteer is assigned to this task
    if (taskExists.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to submit for this task" });
    }

    // Check if submission already exists
    const existingSubmission = await TaskSubmission.findOne({ task, volunteer: req.user._id });
    if (existingSubmission) {
      return res.status(400).json({ success: false, message: "Submission already exists for this task" });
    }

    // Handle file uploads
    const files = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        files.push({
          filename: file.filename,
          originalName: file.originalname,
          path: `/uploads/task-submissions/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size,
        });
      });
    }

    const submission = await TaskSubmission.create({
      task,
      volunteer: req.user._id,
      description: description || "",
      files,
      status: "submitted",
    });

    // Update task status
    taskExists.status = "submitted";
    await taskExists.save();

    // Update volunteer score
    let volunteerScore = await VolunteerScore.findOne({ volunteer: req.user._id });
    if (!volunteerScore) {
      volunteerScore = await VolunteerScore.create({
        volunteer: req.user._id,
      });
    }
    volunteerScore.tasksSubmitted += 1;
    await volunteerScore.save();

    await createNotification({
      recipient: taskExists.assignedBy,
      type: "TASK_SUBMITTED",
      message: `Work was submitted for \"${taskExists.title}\"`,
      relatedProject: taskExists.project,
      relatedTask: taskExists._id,
    });

    await submission.populate("task", "title description");
    await submission.populate("volunteer", "name email");

    return res.status(201).json({
      success: true,
      message: "Task submitted successfully",
      data: { submission: submission.toPublicJSON() },
    });
  } catch (error) {
    console.error("Create submission error:", error);
    return res.status(500).json({ success: false, message: "Server error creating submission" });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const { task, volunteer, status } = req.query;
    const filter = {};

    if (task) filter.task = task;
    if (volunteer) filter.volunteer = volunteer;
    if (status) filter.status = status;

    // Volunteers can only see their own submissions
    if (req.user.role === "student") {
      filter.volunteer = req.user._id;
    } else if (req.user.role === "manager") {
      const managedProjects = await Project.find({ createdBy: req.user._id }).select("_id");
      const tasks = await Task.find({ project: { $in: managedProjects.map((project) => project._id) } }).select("_id");
      filter.task = { $in: tasks.map((task) => task._id) };
    }

    const submissions = await TaskSubmission.find(filter)
      .populate("task", "title description maxScore")
      .populate("volunteer", "name email")
      .populate("scoredBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { submissions: submissions.map((sub) => sub.toPublicJSON()), count: submissions.length },
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching submissions" });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const submission = await TaskSubmission.findById(req.params.id)
      .populate("task", "title description maxScore")
      .populate("volunteer", "name email")
      .populate("scoredBy", "name email");

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Check permissions
    if (req.user.role === "student" && submission.volunteer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this submission" });
    }
    if (req.user.role === "manager" && !(await canManageTask(req.user, submission.task))) {
      return res.status(403).json({ success: false, message: "Not authorized to view this submission" });
    }

    return res.status(200).json({
      success: true,
      data: { submission: submission.toPublicJSON() },
    });
  } catch (error) {
    console.error("Get submission error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching submission" });
  }
};

const scoreSubmission = async (req, res) => {
  try {
    const { score, feedback } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({ success: false, message: "Score is required" });
    }
    if (score < 0) {
      return res.status(400).json({ success: false, message: "Score cannot be negative" });
    }

    const submission = await TaskSubmission.findById(req.params.id)
      .populate("task");

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Check permissions - only managers and admins can score
    if (req.user.role === "student") {
      return res.status(403).json({ success: false, message: "Not authorized to score submissions" });
    }
    if (!(await canManageTask(req.user, submission.task))) {
      return res.status(403).json({ success: false, message: "Not authorized to review this submission" });
    }

    // Ensure score doesn't exceed max score
    if (score > submission.task.maxScore) {
      return res.status(400).json({ 
        success: false, 
        message: `Score cannot exceed maximum score of ${submission.task.maxScore}` 
      });
    }

    const previousScore = submission.score;
    const wasReviewed = submission.status === "reviewed";
    submission.score = score;
    submission.feedback = feedback || "";
    submission.scoredBy = req.user._id;
    submission.scoredAt = new Date();
    submission.status = "reviewed";

    await submission.save();

    // Update volunteer score
    let volunteerScore = await VolunteerScore.findOne({ volunteer: submission.volunteer });
    if (!volunteerScore) {
      volunteerScore = await VolunteerScore.create({
        volunteer: submission.volunteer,
      });
    }

    // Only add to the total once; a later review updates the original score.
    if (!wasReviewed) {
      volunteerScore.totalScore += score;
      volunteerScore.tasksCompleted += 1;
    } else if (previousScore !== score) {
      volunteerScore.totalScore = volunteerScore.totalScore - (previousScore || 0) + score;
    }

    volunteerScore.calculateAverageScore();
    volunteerScore.updateLevel();
    await volunteerScore.save();

    // Update task status
    const task = await Task.findById(submission.task._id);
    task.status = "completed";
    await task.save();

    await createNotification({
      recipient: submission.volunteer,
      type: "TASK_APPROVED",
      message: `Your submission for \"${task.title}\" was approved`,
      relatedProject: task.project,
      relatedTask: task._id,
    });

    await submission.populate("volunteer", "name email");
    await submission.populate("scoredBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Submission scored successfully",
      data: { submission: submission.toPublicJSON() },
    });
  } catch (error) {
    console.error("Score submission error:", error);
    return res.status(500).json({ success: false, message: "Server error scoring submission" });
  }
};

const requestResubmission = async (req, res) => {
  try {
    const { feedback } = req.body;

    if (!feedback?.trim()) {
      return res.status(400).json({ success: false, message: "Feedback is required for resubmission request" });
    }

    const submission = await TaskSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Check permissions
    if (req.user.role === "student") {
      return res.status(403).json({ success: false, message: "Not authorized to request resubmission" });
    }
    const task = await Task.findById(submission.task);
    if (!task || !(await canManageTask(req.user, task))) {
      return res.status(403).json({ success: false, message: "Not authorized to review this submission" });
    }

    submission.feedback = feedback.trim();
    submission.status = "resubmission_required";

    await submission.save();

    // Update task status
    task.status = "in_progress";
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Resubmission requested successfully",
      data: { submission: submission.toPublicJSON() },
    });
  } catch (error) {
    console.error("Request resubmission error:", error);
    return res.status(500).json({ success: false, message: "Server error requesting resubmission" });
  }
};

const deleteSubmission = async (req, res) => {
  try {
    const submission = await TaskSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Check permissions - volunteer can delete their own draft submissions
    if (req.user.role === "student") {
      if (submission.volunteer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Not authorized to delete this submission" });
      }
      if (submission.status !== "draft") {
        return res.status(400).json({ success: false, message: "Can only delete draft submissions" });
      }
    }

    // Delete associated files
    if (submission.files && submission.files.length > 0) {
      submission.files.forEach(file => {
        const filePath = path.join(__dirname, "..", file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await TaskSubmission.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (error) {
    console.error("Delete submission error:", error);
    return res.status(500).json({ success: false, message: "Server error deleting submission" });
  }
};

module.exports = {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  scoreSubmission,
  requestResubmission,
  deleteSubmission,
};
