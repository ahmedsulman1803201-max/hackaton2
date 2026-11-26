const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("../routes/authRoutes");
const studentRoutes = require("../routes/studentRoutes");
const managerRoutes = require("../routes/managerRoutes");
const adminRoutes = require("../routes/adminRoutes");
const projectRoutes = require("../routes/projectRoutes");
const applicationRoutes = require("../routes/applicationRoutes");
const taskRoutes = require("../routes/taskRoutes");
const commentRoutes = require("../routes/commentRoutes");
const notificationRoutes = require("../routes/notificationRoutes");
const submissionRoutes = require("../routes/submissionRoutes");
const scoreRoutes = require("../routes/scoreRoutes");

const app = express();
app.use(cors({
  origin: (process.env.CLIENT_ORIGIN || "").split(",").filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "ImpactHub API is running",
    database: mongoose.connection.readyState === 1 ? "connected" : "connecting",
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
app.use((error, _req, res, _next) => {
  console.error("Unhandled API error:", error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Unexpected API error",
  });
});

let connectionPromise;
async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured");
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI)
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }
  await connectionPromise;
}

module.exports = async (req, res) => {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return res.status(503).json({
      success: false,
      message: "Database connection unavailable. Check the backend environment variables and MongoDB Atlas network access.",
    });
  }
};
