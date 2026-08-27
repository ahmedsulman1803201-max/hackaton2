const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const router = express.Router();

// All notification routes require authentication.
router.use(protect);

router.get("/", getNotifications);
router.get("/unread", getUnreadNotifications);
router.put("/read-all", markAllNotificationsAsRead);
router.put("/:id/read", markNotificationAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
