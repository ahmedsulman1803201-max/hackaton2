const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("relatedProject", "title")
      .populate("relatedTask", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        notifications: notifications.map((notification) => notification.toPublicJSON()),
        count: notifications.length,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching notifications" });
  }
};

const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id, isRead: false }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        notifications: notifications.map((notification) => notification.toPublicJSON()),
        count: notifications.length,
      },
    });
  } catch (error) {
    console.error("Get unread notifications error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching unread notifications" });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (notification.recipient.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this notification" });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: { notification: notification.toPublicJSON() },
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return res.status(500).json({ success: false, message: "Server error updating notification" });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: "Notifications marked as read",
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return res.status(500).json({ success: false, message: "Server error updating notifications" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (notification.recipient.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this notification" });
    }

    await Notification.findByIdAndDelete(notification._id);

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({ success: false, message: "Server error deleting notification" });
  }
};

module.exports = {
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
