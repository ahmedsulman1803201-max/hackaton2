const mongoose = require("mongoose");

const taskSubmissionSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task is required"],
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Volunteer is required"],
    },
    description: {
      type: String,
      default: "",
    },
    files: [{
      filename: String,
      originalName: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    score: {
      type: Number,
      default: null,
      min: [0, "Score cannot be negative"],
    },
    feedback: {
      type: String,
      default: "",
    },
    studentReaction: {
      type: String,
      enum: ["", "acknowledged"],
      default: "",
    },
    reactedAt: {
      type: Date,
      default: null,
    },
    scoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    scoredAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ["draft", "submitted", "reviewed", "resubmission_required"],
        message: "Status must be draft, submitted, reviewed, or resubmission_required",
      },
      default: "draft",
    },
  },
  { timestamps: true }
);

taskSubmissionSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    task: this.task,
    volunteer: this.volunteer,
    description: this.description,
    files: this.files,
    score: this.score,
    feedback: this.feedback,
    studentReaction: this.studentReaction,
    reactedAt: this.reactedAt,
    scoredBy: this.scoredBy,
    scoredAt: this.scoredAt,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("TaskSubmission", taskSubmissionSchema);
