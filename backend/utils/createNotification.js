const Notification = require("../models/Notification");

// Avoid duplicate events when an action is retried while keeping notification
// delivery from changing the outcome of the original application or task action.
const createNotification = async (notification) => {
  if (!notification?.recipient) return;
  try {
    const existingNotification = await Notification.findOne({
      recipient: notification.recipient,
      type: notification.type,
      message: notification.message,
      relatedProject: notification.relatedProject || null,
      relatedTask: notification.relatedTask || null,
      relatedApplication: notification.relatedApplication || null,
      relatedComment: notification.relatedComment || null,
    });

    if (!existingNotification) {
      await Notification.create(notification);
    }
  } catch (error) {
    console.error("Create notification error:", error);
  }
};

module.exports = createNotification;
