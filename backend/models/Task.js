const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned volunteer is required"],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigner is required"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "in_progress", "submitted", "completed", "overdue"],
        message: "Status must be pending, in_progress, submitted, completed, or overdue",
      },
      default: "pending",
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "urgent"],
        message: "Priority must be low, medium, high, or urgent",
      },
      default: "medium",
    },
    maxScore: {
      type: Number,
      default: 100,
      min: [0, "Max score cannot be negative"],
    },
    submissionRequirements: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

taskSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    project: this.project,
    assignedTo: this.assignedTo,
    assignedBy: this.assignedBy,
    dueDate: this.dueDate,
    status: this.status,
    priority: this.priority,
    maxScore: this.maxScore,
    submissionRequirements: this.submissionRequirements,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Task", taskSchema);
