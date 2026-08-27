const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/test", protect, authorizeRoles("student"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student access granted",
    data: { role: req.user.role, userId: req.user._id },
  });
});

module.exports = router;
