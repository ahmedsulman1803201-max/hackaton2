const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification recipient is required"],
    },
    type: {
      type: String,
      enum: {
        values: [
          "APPLICATION_RECEIVED",
          "APPLICATION_APPROVED",
          "APPLICATION_REJECTED",
          "TASK_ASSIGNED",
          "TASK_STATUS_UPDATED",
          "TASK_SUBMITTED",
          "TASK_APPROVED",
          "TASK_REJECTED",
          "PROJECT_APPROVED",
          "PROJECT_REJECTED",
          "COMMENT_POSTED",
          "COMMENT_REPLY",
        ],
        message: "Invalid notification type",
      },
      required: [true, "Notification type is required"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
    relatedComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    recipient: this.recipient,
    type: this.type,
    message: this.message,
    relatedProject: this.relatedProject,
    relatedTask: this.relatedTask,
    relatedApplication: this.relatedApplication,
    relatedComment: this.relatedComment,
    isRead: this.isRead,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Notification", notificationSchema);
