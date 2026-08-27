const express = require("express");
const { protect, optionalAuth } = require("../middleware/auth");
const {
  createComment,
  getProjectComments,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

const router = express.Router();

router.get("/project/:projectId", optionalAuth, getProjectComments);

router.use(protect);
router.post("/", createComment);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

module.exports = router;
