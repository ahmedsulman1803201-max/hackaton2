const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const { projectImageUpload, handleMulterError } = require("../config/multer");
const {
  getDashboard,
  getUsers,
  deleteUser,
  createUser,
  updateUser,
  getVolunteers,
  getProjects,
  approveProject,
  rejectProject,
  createProject,
  updateProject,
  deleteProject,
  getApplications,
} = require("../controllers/adminController");

const router = express.Router();

// Admin identity comes from protect's database lookup; request-body roles are ignored.
router.use(protect, authorizeRoles("admin"));

// Dashboard
router.get("/dashboard", getDashboard);

// User Management
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/volunteers", getVolunteers);

// Project Management
router.get("/projects", getProjects);
router.post("/projects", (req, res, next) => {
  projectImageUpload.single("projectImage")(req, res, (err) => {
    if (err) {
      handleMulterError(err, req, res, next);
    } else {
      next();
    }
  });
}, createProject);
router.put("/projects/:id", (req, res, next) => {
  projectImageUpload.single("projectImage")(req, res, (err) => {
    if (err) {
      handleMulterError(err, req, res, next);
    } else {
      next();
    }
  });
}, updateProject);
router.delete("/projects/:id", deleteProject);
router.put("/projects/:id/approve", approveProject);
router.put("/projects/:id/reject", rejectProject);

// Applications
router.get("/applications", getApplications);

module.exports = router;
