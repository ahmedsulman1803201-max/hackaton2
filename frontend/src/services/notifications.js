import api from "./api";
import { entityId } from "../utils/ids";

const TITLES = {
  APPLICATION_RECEIVED: "New application",
  APPLICATION_APPROVED: "Application approved",
  APPLICATION_REJECTED: "Application declined",
  TASK_ASSIGNED: "Task assigned",
  TASK_STATUS_UPDATED: "Task updated",
  TASK_SUBMITTED: "Submission received",
  TASK_APPROVED: "Submission reviewed",
  TASK_REJECTED: "Resubmission requested",
  COMMENT_POSTED: "New discussion post",
  COMMENT_REPLY: "New reply",
};

const ICONS = {
  APPLICATION_RECEIVED: "application",
  APPLICATION_APPROVED: "application",
  APPLICATION_REJECTED: "application",
  TASK_ASSIGNED: "task",
  TASK_STATUS_UPDATED: "task",
  TASK_SUBMITTED: "task",
  TASK_APPROVED: "task",
  TASK_REJECTED: "task",
  COMMENT_POSTED: "comment",
  COMMENT_REPLY: "comment",
};

export const notificationLink = (notification) => {
  const projectId = entityId(notification.relatedProject);
  switch (notification.type) {
    case "APPLICATION_RECEIVED":
      return "/applications";
    case "APPLICATION_APPROVED":
      return projectId ? `/projects/${projectId}` : "/my-projects";
    case "APPLICATION_REJECTED":
      return "/applications";
    case "TASK_ASSIGNED":
    case "TASK_STATUS_UPDATED":
    case "TASK_SUBMITTED":
    case "TASK_APPROVED":
    case "TASK_REJECTED":
      return projectId ? `/projects/${projectId}/tasks` : "/tasks";
    case "COMMENT_POSTED":
    case "COMMENT_REPLY":
      return projectId ? `/projects/${projectId}/discussion` : "/notifications";
    default:
      return "/notifications";
  }
};

export const mapNotification = (notification) => ({
  ...notification,
  id: entityId(notification.id || notification._id),
  title: TITLES[notification.type] || "Notification",
  kind: ICONS[notification.type] || "system",
  read: Boolean(notification.isRead),
  link: notificationLink(notification),
});

export const fetchNotifications = async () => {
  const { data } = await api.get("/notifications");
  return (data.data.notifications || []).map(mapNotification);
};

export const markNotificationRead = async (id) => {
  await api.put(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async () => {
  await api.put("/notifications/read-all");
};

export const deleteNotification = async (id) => {
  await api.delete(`/notifications/${id}`);
};
