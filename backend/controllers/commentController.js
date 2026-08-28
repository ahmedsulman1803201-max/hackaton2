const Comment = require("../models/Comment");
const Project = require("../models/Project");
const createNotification = require("../utils/createNotification");

const userId = (value) => value?.toString();

const canDiscuss = (project, user) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (userId(project.createdBy) === userId(user._id)) return true;
  return project.members.some((member) => userId(member) === userId(user._id));
};

const populateComment = (query) =>
  query.populate("author", "name email profilePicture role");

const notifyProjectParticipants = async (project, author, comment) => {
  const recipients = [project.createdBy, ...project.members]
    .map(userId)
    .filter((id, index, all) => id && id !== userId(author) && all.indexOf(id) === index);

  await Promise.all(recipients.map((recipient) => createNotification({
    recipient,
    type: "COMMENT_POSTED",
    message: `${author.name} posted in ${project.title}`,
    relatedProject: project._id,
    relatedComment: comment._id,
  })));
};

const createComment = async (req, res) => {
  try {
    const { content, project: projectId, parentComment } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }
    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!canDiscuss(project, req.user)) {
      return res.status(403).json({ success: false, message: "Join this project to post in the discussion" });
    }

    let parent = null;
    if (parentComment) {
      parent = await Comment.findById(parentComment);
      if (!parent || userId(parent.project) !== userId(project._id)) {
        return res.status(400).json({ success: false, message: "Parent comment was not found on this project" });
      }
    }

    const comment = await Comment.create({
      content: content.trim(),
      project: project._id,
      author: req.user.id,
      parentComment: parent?._id || null,
    });

    if (parent && userId(parent.author) !== userId(req.user._id)) {
      await createNotification({
        recipient: parent.author,
        type: "COMMENT_REPLY",
        message: `${req.user.name} replied to your comment on ${project.title}`,
        relatedProject: project._id,
        relatedComment: comment._id,
      });
    } else if (!parent) {
      await notifyProjectParticipants(project, req.user, comment);
    }

    const populated = await populateComment(Comment.findById(comment._id));

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: { comment: populated.toPublicJSON() },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors).map((entry) => entry.message).join(", ");
      return res.status(400).json({ success: false, message });
    }
    console.error("Create comment error:", error);
    return res.status(500).json({ success: false, message: "Server error during comment creation" });
  }
};

const getProjectComments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const comments = await populateComment(Comment.find({ project: projectId })).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: {
        comments: comments.map((comment) => comment.toPublicJSON()),
        count: comments.length,
        canComment: canDiscuss(project, req.user),
      },
    });
  } catch (error) {
    console.error("Get project comments error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching comments" });
  }
};

const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (userId(comment.author) !== userId(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this comment" });
    }

    comment.content = content.trim();
    await comment.save();
    const populated = await populateComment(Comment.findById(comment._id));

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: { comment: populated.toPublicJSON() },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors).map((entry) => entry.message).join(", ");
      return res.status(400).json({ success: false, message });
    }
    console.error("Update comment error:", error);
    return res.status(500).json({ success: false, message: "Server error during comment update" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const isAuthor = userId(comment.author) === userId(req.user._id);
    if (!isAuthor) {
      const project = await Project.findById(comment.project);
      const isProjectManager = project && userId(project.createdBy) === userId(req.user._id);
      if (!isProjectManager && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
      }
    }

    await Comment.deleteMany({ $or: [{ _id: comment._id }, { parentComment: comment._id }] });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({ success: false, message: "Server error during comment deletion" });
  }
};

module.exports = {
  createComment,
  getProjectComments,
  updateComment,
  deleteComment,
};
