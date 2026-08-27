const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Project category is required"],
      trim: true,
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
      required: [true, "Project start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Project end date is required"],
    },
    requiredVolunteers: {
      type: Number,
      required: [true, "Required number of volunteers is required"],
      min: [1, "Required volunteers must be at least 1"],
    },
    projectImage: {
      type: String,
      default: "",
    },
    files: [{
      filename: String,
      originalName: String,
      relativePath: String,
      path: String,
      mimetype: String,
      size: Number,
      folder: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectFolder", default: null },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    }],
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "active", "completed", "rejected"],
        message: "Status must be pending, approved, active, completed, or rejected",
      },
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project creator is required"],
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  { timestamps: true }
);

projectSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    category: this.category,
    skillsRequired: this.skillsRequired,
    location: this.location,
    startDate: this.startDate,
    endDate: this.endDate,
    requiredVolunteers: this.requiredVolunteers,
    projectImage: this.projectImage,
    files: this.files || [],
    status: this.status,
    rejectionReason: this.rejectionReason,
    createdBy: this.createdBy,
    members: this.members,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Project", projectSchema);
