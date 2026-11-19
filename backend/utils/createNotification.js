const Notification = require("../models/Notification");
const User = require("../models/User");

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

const notifyAdmins = async (notification) => {
  try {
    const admins = await User.find({ role: "admin" }).select("_id");
    await Promise.all(admins.map((admin) => createNotification({ ...notification, recipient: admin._id })));
  } catch (error) {
    console.error("Notify admins error:", error);
  }
};

module.exports = createNotification;
module.exports.notifyAdmins = notifyAdmins;
