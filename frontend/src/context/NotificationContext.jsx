import { useCallback, useEffect, useState } from "react";
import {
  deleteNotification as deleteNotificationRequest,
  fetchNotifications,
  markAllNotificationsRead as markAllNotificationsReadRequest,
  markNotificationRead as markNotificationReadRequest,
} from "../services/notifications";
import { useAuth } from "./useAuth";
import { NotificationContext } from "./notificationContextBase";

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.token) {
      setNotifications([]);
      return [];
    }
    setLoading(true);
    try {
      const items = await fetchNotifications();
      setNotifications(items);
      return items;
    } catch {
      setNotifications([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    queueMicrotask(() => { void refresh(); });
    if (!user?.token) return undefined;
    const timer = setInterval(refresh, 15000);
    return () => clearInterval(timer);
  }, [refresh, user?.token]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markRead = async (id) => {
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true, isRead: true } : item)));
    try {
      await markNotificationReadRequest(id);
    } catch {
      refresh();
    }
  };

  const markAllRead = async () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true, isRead: true })));
    try {
      await markAllNotificationsReadRequest();
    } catch {
      refresh();
    }
  };

  const remove = async (id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
    try {
      await deleteNotificationRequest(id);
    } catch {
      refresh();
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, markRead, markAllRead, remove, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
};
