const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const { taskSubmissionUpload, handleMulterError } = require("../config/multer");
const {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  scoreSubmission,
  requestResubmission,
  deleteSubmission,
} = require("../controllers/taskSubmissionController");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorizeRoles("student"),
  (req, res, next) => {
    taskSubmissionUpload.array("files", 50)(req, res, (err) => {
      if (err) {
        handleMulterError(err, req, res, next);
      } else {
        next();
      }
    });
  },
  createSubmission
);

router.get("/", getSubmissions);
router.get("/:id", getSubmissionById);
router.put("/:id/score", authorizeRoles("manager", "admin"), scoreSubmission);
router.put("/:id/resubmit", authorizeRoles("manager", "admin"), requestResubmission);
router.delete("/:id", deleteSubmission);

module.exports = router;
