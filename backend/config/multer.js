const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directories exist
const projectImagesDir = path.join(__dirname, "../uploads/project-images");
const taskSubmissionsDir = path.join(__dirname, "../uploads/task-submissions");
const projectFilesDir = path.join(__dirname, "../uploads/project-files");

if (!fs.existsSync(projectImagesDir)) {
  fs.mkdirSync(projectImagesDir, { recursive: true });
}
if (!fs.existsSync(taskSubmissionsDir)) {
  fs.mkdirSync(taskSubmissionsDir, { recursive: true });
}
if (!fs.existsSync(projectFilesDir)) fs.mkdirSync(projectFilesDir, { recursive: true });

// Configure storage for project images
const projectImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, projectImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, "project-" + uniqueSuffix + ext);
  }
});

// Configure storage for task submissions (multiple files)
const taskSubmissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, taskSubmissionsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, "task-" + uniqueSuffix + ext);
  }
});

const projectFileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, projectFilesDir),
  filename: (req, file, cb) => cb(null, `project-file-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});

// File filter to accept only images for project images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed"));
  }
};

// File filter for task submissions (accept documents, images, etc.)
const taskSubmissionFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error("Only files with extensions: jpeg, jpg, png, gif, webp, pdf, doc, docx, txt, zip, rar are allowed"));
  }
};

// Configure multer for project images
const projectImageUpload = multer({
  storage: projectImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Configure multer for task submissions (multiple files)
const taskSubmissionUpload = multer({
  storage: taskSubmissionStorage,
  fileFilter: taskSubmissionFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 50
  }
});

const projectFileUpload = multer({ storage: projectFileStorage, fileFilter: taskSubmissionFileFilter, limits: { fileSize: 10 * 1024 * 1024, files: 50 } });

// A project form can submit one cover image plus many shared files in one request.
const projectAssetsUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, file.fieldname === "projectImage" ? projectImagesDir : projectFilesDir),
    filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
  }),
  fileFilter: (req, file, cb) => file.fieldname === "projectImage" ? imageFileFilter(req, file, cb) : taskSubmissionFileFilter(req, file, cb),
  limits: { fileSize: 10 * 1024 * 1024, files: 101 },
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File size too large" });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ success: false, message: "Too many files uploaded" });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ success: false, message: "Unexpected file field" });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

// Legacy single upload for backward compatibility
const upload = projectImageUpload.single("projectImage");

module.exports = { 
  projectImageUpload, 
  taskSubmissionUpload, 
  projectFileUpload,
  projectAssetsUpload,
  handleMulterError,
  upload // for backward compatibility
};
