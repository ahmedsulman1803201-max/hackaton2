const mongoose = require("mongoose");

const volunteerScoreSchema = new mongoose.Schema(
  {
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Volunteer is required"],
      unique: true,
    },
    totalScore: {
      type: Number,
      default: 0,
      min: [0, "Total score cannot be negative"],
    },
    tasksCompleted: {
      type: Number,
      default: 0,
      min: [0, "Tasks completed cannot be negative"],
    },
    tasksSubmitted: {
      type: Number,
      default: 0,
      min: [0, "Tasks submitted cannot be negative"],
    },
    averageScore: {
      type: Number,
      default: 0,
      min: [0, "Average score cannot be negative"],
    },
    projectParticipation: [{
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      tasksCompleted: {
        type: Number,
        default: 0,
      },
    }],
    badges: [{
      type: String,
      enum: {
        values: ["first_task", "high_performer", "consistent", "team_player", "leader", "fast_learner"],
        message: "Invalid badge type",
      },
    }],
    level: {
      type: String,
      enum: {
        values: ["beginner", "intermediate", "advanced", "expert"],
        message: "Level must be beginner, intermediate, advanced, or expert",
      },
      default: "beginner",
    },
  },
  { timestamps: true }
);

volunteerScoreSchema.methods.calculateAverageScore = function() {
  if (this.tasksCompleted === 0) {
    this.averageScore = 0;
  } else {
    this.averageScore = Math.round((this.totalScore / this.tasksCompleted) * 100) / 100;
  }
  return this.averageScore;
};

volunteerScoreSchema.methods.updateLevel = function() {
  if (this.averageScore >= 90 && this.tasksCompleted >= 10) {
    this.level = "expert";
  } else if (this.averageScore >= 75 && this.tasksCompleted >= 5) {
    this.level = "advanced";
  } else if (this.averageScore >= 60 && this.tasksCompleted >= 3) {
    this.level = "intermediate";
  } else {
    this.level = "beginner";
  }
  return this.level;
};

volunteerScoreSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    volunteer: this.volunteer,
    totalScore: this.totalScore,
    tasksCompleted: this.tasksCompleted,
    tasksSubmitted: this.tasksSubmitted,
    averageScore: this.averageScore,
    projectParticipation: this.projectParticipation,
    badges: this.badges,
    level: this.level,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("VolunteerScore", volunteerScoreSchema);
