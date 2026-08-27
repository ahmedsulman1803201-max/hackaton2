const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const {
  createApplication,
  getMyApplications,
  getManagedApplications,
  getProjectApplications,
  approveApplication,
  rejectApplication,
} = require("../controllers/applicationController");

const router = express.Router();

// All application routes require authentication
router.use(protect);

// POST /api/applications - Create application (Volunteer only)
router.post("/", authorizeRoles("student"), createApplication);

router.get("/my", authorizeRoles("student"), getMyApplications);
router.get("/managed", authorizeRoles("manager", "admin"), getManagedApplications);

// GET /api/applications/project/:projectId - Get applications for a project (Manager only)
router.get("/project/:projectId", authorizeRoles("manager", "admin"), getProjectApplications);

// PUT /api/applications/:id/approve - Approve application (Manager only)
router.put("/:id/approve", authorizeRoles("manager", "admin"), approveApplication);

// PUT /api/applications/:id/reject - Reject application (Manager only)
router.put("/:id/reject", authorizeRoles("manager", "admin"), rejectApplication);

module.exports = router;
