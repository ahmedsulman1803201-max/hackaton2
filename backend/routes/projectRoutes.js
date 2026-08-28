const express = require("express");
const { protect, authorizeRoles } = require("../middleware/auth");
const { projectAssetsUpload, handleMulterError } = require("../config/multer");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { getFolders, createFolder, renameFolder, deleteFolder, uploadResource, deleteResource } = require("../controllers/projectFolderController");

const router = express.Router();

// Discovery and project detail pages are public.  Mutations remain protected
// below, so the public catalogue can use the same database records as signed-in
// users instead of browser-only demo data.
router.get("/", getProjects);
router.get("/:id", getProjectById);
// Manager-uploaded folders and files are shared project resources.  Keep this
// read endpoint public so every visitor can browse them; write operations stay
// behind authentication and manager/admin authorization below.
router.get("/:projectId/folders", getFolders);

router.use(protect);

const uploadResourceFile = (req, res, next) => projectAssetsUpload.single("file")(req, res, (err) => err ? handleMulterError(err, req, res, next) : next());
router.post("/:projectId/folders", authorizeRoles("manager", "admin"), createFolder);
router.put("/:projectId/folders/:folderId", authorizeRoles("manager", "admin"), renameFolder);
router.delete("/:projectId/folders/:folderId", authorizeRoles("manager", "admin"), deleteFolder);
router.post("/:projectId/resources", authorizeRoles("manager", "admin"), uploadResourceFile, uploadResource);
router.delete("/:projectId/resources/:fileId", authorizeRoles("manager", "admin"), deleteResource);

// POST /api/projects - Create a new project (Manager only)
const uploadProjectAssets = (req, res, next) => projectAssetsUpload.fields([{ name: "projectImage", maxCount: 1 }, { name: "projectFiles", maxCount: 100 }])(req, res, (err) => {
    if (err) {
      handleMulterError(err, req, res, next);
    } else {
      next();
    }
  });
router.post("/", authorizeRoles("manager", "admin"), uploadProjectAssets, createProject);

// PUT /api/projects/:id - Update a project (Manager only, and only their own projects)
router.put("/:id", authorizeRoles("manager", "admin"), uploadProjectAssets, updateProject);

// DELETE /api/projects/:id - Delete a project (Manager only, and only their own projects)
router.delete("/:id", authorizeRoles("manager", "admin"), deleteProject);

module.exports = router;
