const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, "Application message cannot exceed 1000 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Status must be pending, approved, or rejected",
      },
      default: "pending",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Create a compound index to prevent duplicate applications
applicationSchema.index({ student: 1, project: 1 }, { unique: true });

applicationSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    student: this.student,
    project: this.project,
    message: this.message,
    status: this.status,
    appliedAt: this.appliedAt,
    reviewedAt: this.reviewedAt,
    reviewedBy: this.reviewedBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Application", applicationSchema);
