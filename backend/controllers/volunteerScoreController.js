const VolunteerScore = require("../models/VolunteerScore");
const User = require("../models/User");

const getVolunteerScores = async (req, res) => {
  try {
    const { volunteer, level } = req.query;
    const filter = {};

    if (volunteer) filter.volunteer = volunteer;
    if (level) filter.level = level;

    const scores = await VolunteerScore.find(filter)
      .populate("volunteer", "name email skills profilePicture")
      .populate("projectParticipation.project", "title")
      .sort({ totalScore: -1 });

    return res.status(200).json({
      success: true,
      data: { scores: scores.map((score) => score.toPublicJSON()), count: scores.length },
    });
  } catch (error) {
    console.error("Get volunteer scores error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching volunteer scores" });
  }
};

const getVolunteerScoreById = async (req, res) => {
  try {
    if (req.user.role === "student" && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this score" });
    }
    const score = await VolunteerScore.findOne({ volunteer: req.params.id })
      .populate("volunteer", "name email skills profilePicture")
      .populate("projectParticipation.project", "title");

    if (!score) {
      return res.status(404).json({ success: false, message: "Volunteer score not found" });
    }

    return res.status(200).json({
      success: true,
      data: { score: score.toPublicJSON() },
    });
  } catch (error) {
    console.error("Get volunteer score error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching volunteer score" });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, level, sort = "totalScore" } = req.query;
    const filter = {};

    if (level) filter.level = level;

    const scores = await VolunteerScore.find(filter)
      .populate("volunteer", "name email profilePicture")
      .sort(sort === "completed" ? { tasksCompleted: -1, totalScore: -1 } : sort === "average" ? { averageScore: -1, totalScore: -1 } : { totalScore: -1 })
      .limit(Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100));

    return res.status(200).json({
      success: true,
      data: { 
        leaderboard: scores.map((score, index) => ({
          rank: index + 1,
          ...score.toPublicJSON(),
        })),
        count: scores.length 
      },
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching leaderboard" });
  }
};

const getScoreboard = getVolunteerScores;

// Direct score adjustments are intentionally administrator-only. Managers award
// task marks through /api/submissions/:id/score, where project ownership is
// verifiable and the task/submission audit trail is preserved.
const assignScore = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Managers must score a task submission; only admins can make manual score adjustments" });
    const scoreValue = Number(req.body.score);
    if (!Number.isFinite(scoreValue) || scoreValue < 0) return res.status(400).json({ success: false, message: "Score must be a non-negative number" });
    const volunteer = await User.findById(req.params.id);
    if (!volunteer || volunteer.role !== "student") return res.status(404).json({ success: false, message: "Volunteer not found" });
    let score = await VolunteerScore.findOne({ volunteer: volunteer._id });
    if (!score) score = await VolunteerScore.create({ volunteer: volunteer._id });
    score.totalScore += scoreValue;
    score.calculateAverageScore();
    score.updateLevel();
    await score.save();
    return res.status(200).json({ success: true, message: "Contribution score adjusted", data: { score: score.toPublicJSON() } });
  } catch (error) {
    console.error("Assign score error:", error);
    return res.status(500).json({ success: false, message: "Server error assigning score" });
  }
};

const addBadge = async (req, res) => {
  try {
    const { badge } = req.body;

    if (!badge) {
      return res.status(400).json({ success: false, message: "Badge is required" });
    }

    const validBadges = ["first_task", "high_performer", "consistent", "team_player", "leader", "fast_learner"];
    if (!validBadges.includes(badge)) {
      return res.status(400).json({ success: false, message: "Invalid badge type" });
    }

    let score = await VolunteerScore.findOne({ volunteer: req.params.id });
    if (!score) {
      score = await VolunteerScore.create({
        volunteer: req.params.id,
      });
    }

    if (!score.badges.includes(badge)) {
      score.badges.push(badge);
      await score.save();
    }

    await score.populate("volunteer", "name email");

    return res.status(200).json({
      success: true,
      message: "Badge added successfully",
      data: { score: score.toPublicJSON() },
    });
  } catch (error) {
    console.error("Add badge error:", error);
    return res.status(500).json({ success: false, message: "Server error adding badge" });
  }
};

const removeBadge = async (req, res) => {
  try {
    const { badge } = req.body;

    if (!badge) {
      return res.status(400).json({ success: false, message: "Badge is required" });
    }

    const score = await VolunteerScore.findOne({ volunteer: req.params.id });
    if (!score) {
      return res.status(404).json({ success: false, message: "Volunteer score not found" });
    }

    score.badges = score.badges.filter(b => b !== badge);
    await score.save();

    await score.populate("volunteer", "name email");

    return res.status(200).json({
      success: true,
      message: "Badge removed successfully",
      data: { score: score.toPublicJSON() },
    });
  } catch (error) {
    console.error("Remove badge error:", error);
    return res.status(500).json({ success: false, message: "Server error removing badge" });
  }
};

module.exports = {
  getVolunteerScores,
  getVolunteerScoreById,
  getLeaderboard,
  getScoreboard,
  assignScore,
  addBadge,
  removeBadge,
};
