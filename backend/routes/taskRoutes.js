const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const router = express.Router();

// All task routes require authentication
router.use(protect);

// POST /api/tasks - Create task (Manager only)
router.post("/", authorizeRoles("manager", "admin"), createTask);

// GET /api/tasks/project/:projectId - Get tasks for a project (Manager only)
// Query params: status, priority, assignedTo
router.get("/project/:projectId", authorizeRoles("manager", "admin"), (req, res, next) => {
  req.query.project = req.params.projectId;
  next();
}, getTasks);

// GET /api/tasks/my - Get my assigned tasks (Student only)
router.get("/my", authorizeRoles("student"), getTasks);

router.get("/", getTasks);

// GET /api/tasks/:id - Get task details (Authenticated users with access)
router.get("/:id", getTaskById);

// PUT /api/tasks/:id/status - Update task status (Student only)
router.put("/:id/status", authorizeRoles("student"), updateTask);

// PUT /api/tasks/:id - Update task details (Manager only)
router.put("/:id", authorizeRoles("manager", "admin"), updateTask);

// DELETE /api/tasks/:id - Delete task (Manager only)
router.delete("/:id", authorizeRoles("manager", "admin"), deleteTask);

module.exports = router;
