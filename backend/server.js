require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const managerRoutes = require("./routes/managerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const projectRoutes = require("./routes/projectRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const taskRoutes = require("./routes/taskRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const scoreRoutes = require("./routes/scoreRoutes");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((value) => value.trim())
    : true,
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

// Local uploads are served during local development. Vercel's filesystem is
// ephemeral; persistent uploads need an object-storage provider.
const uploadDirectory = process.env.VERCEL
  ? path.join("/tmp", "impacthub-uploads")
  : path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadDirectory));

// Ensure every serverless request has a database connection before using routes.
app.use(async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: "JWT_SECRET is not configured" });
  }
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    res.status(503).json({
      success: false,
      message: "Database connection unavailable. Check MONGO_URI and MongoDB Atlas network access.",
    });
  }
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "ImpactHub API is running",
    database: "connected",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/scores", scoreRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: "API route not found" }));
app.use((error, req, res, next) => {
  console.error("Unhandled API error:", error);
  res.status(error.status || 500).json({ success: false, message: error.message || "Unexpected server error" });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`)))
    .catch((error) => {
      console.error("Unable to start server:", error.message);
      process.exitCode = 1;
    });
}

module.exports = app;
