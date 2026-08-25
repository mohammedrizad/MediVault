import React, { createContext, useContext, useState, useCallback } from "react";
import PropTypes from "prop-types";

const NotificationContext = createContext();

// Default demo notifications
const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    type: "alert",
    title: "Critical Lab Result",
    message:
      "Your recent blood test shows elevated WBC count. Please consult your doctor.",
    timestamp: new Date("2026-02-16T10:30:00").toISOString(),
    read: false,
    link: "/patient/history",
  },
  {
    id: "n2",
    type: "access",
    title: "New Record Access",
    message: "City General Hospital requested access to your medical records.",
    timestamp: new Date("2026-02-15T14:22:00").toISOString(),
    read: false,
    link: "/patient/access-manager",
  },
  {
    id: "n3",
    type: "system",
    title: "System Maintenance",
    message: "Scheduled maintenance on Feb 20, 2026 from 2:00 AM - 4:00 AM.",
    timestamp: new Date("2026-02-14T09:00:00").toISOString(),
    read: false,
    link: null,
  },
  {
    id: "n4",
    type: "alert",
    title: "Prescription Reminder",
    message:
      "Your Metformin prescription expires in 5 days. Schedule a refill.",
    timestamp: new Date("2026-02-13T16:45:00").toISOString(),
    read: true,
    link: "/patient/dashboard",
  },
  {
    id: "n5",
    type: "access",
    title: "Access Revoked",
    message: "You revoked access for National Medical Institute.",
    timestamp: new Date("2026-02-12T11:15:00").toISOString(),
    read: true,
    link: "/patient/access-manager",
  },
  {
    id: "n6",
    type: "system",
    title: "New Feature Available",
    message:
      "Report Simplifier is now available — simplify your medical reports with AI.",
    timestamp: new Date("2026-02-11T08:00:00").toISOString(),
    read: true,
    link: "/patient/report-simplifier",
  },
  {
    id: "n7",
    type: "alert",
    title: "Appointment Reminder",
    message: "You have an appointment with Dr. Smith tomorrow at 10:00 AM.",
    timestamp: new Date("2026-02-10T17:00:00").toISOString(),
    read: true,
    link: "/patient/appointments",
  },
  {
    id: "n8",
    type: "access",
    title: "Access Approved",
    message: "St. Mary's Medical Center was granted access to your records.",
    timestamp: new Date("2026-02-09T12:30:00").toISOString(),
    read: true,
    link: "/patient/access-manager",
  },
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((notification) => {
    const newNotif = {
      id: `n_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      link: null,
      ...notification,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

export default NotificationContext;
