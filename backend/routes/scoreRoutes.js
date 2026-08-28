const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const {
  getVolunteerScores,
  getVolunteerScoreById,
  getLeaderboard,
  getScoreboard,
  assignScore,
  addBadge,
  removeBadge,
} = require("../controllers/volunteerScoreController");

const router = express.Router();

router.use(protect);

router.get("/leaderboard", getLeaderboard);
router.get("/scoreboard", authorizeRoles("manager", "admin"), getScoreboard);
router.get("/", authorizeRoles("manager", "admin"), getVolunteerScores);
router.get("/:id", getVolunteerScoreById);
router.post("/:id/assign", authorizeRoles("manager", "admin"), assignScore);
router.post("/:id/badge", authorizeRoles("manager", "admin"), addBadge);
router.delete("/:id/badge", authorizeRoles("manager", "admin"), removeBadge);

module.exports = router;
