import { useState, useCallback, useMemo } from "react";
import { Notification, NotificationType } from "@/components/notifications/types";
import { useMode } from "@/contexts/ModeContext";

// Mock notifications data
const generateMockNotifications = (): Notification[] => [
  // System notifications
  {
    id: "1",
    type: "system",
    title: "Welcome to Eduminity!",
    message: "Explore thousands of study materials and start learning today.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: "2",
    type: "system",
    title: "New Features Available",
    message: "Check out the new Q&A section and community features.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
  },
  // Student notifications
  {
    id: "3",
    type: "purchase_confirmation",
    title: "Purchase Successful!",
    message: "You've successfully purchased 'Advanced Physics Notes'",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    actionUrl: "/app/materials",
  },
  {
    id: "4",
    type: "saved_note_alert",
    title: "Price Drop Alert",
    message: "A note in your saved list is now 20% off!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: false,
  },
  {
    id: "5",
    type: "recommendation",
    title: "Recommended for You",
    message: "Based on your interests: 'Organic Chemistry Made Easy'",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    read: true,
  },
  // Contributor notifications
  {
    id: "6",
    type: "new_sale",
    title: "New Sale! 🎉",
    message: "Someone purchased your 'Calculus Complete Guide'",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
  },
  {
    id: "7",
    type: "upload_approved",
    title: "Upload Approved",
    message: "Your 'Biology Chapter 5 Notes' is now live!",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    read: false,
  },
  {
    id: "8",
    type: "review_received",
    title: "New Review",
    message: "Someone left a 5-star review on your notes!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    read: true,
  },
  {
    id: "9",
    type: "earnings_milestone",
    title: "Milestone Reached! 🏆",
    message: "Congratulations! You've earned ৳10,000 total!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
  {
    id: "10",
    type: "upload_rejected",
    title: "Upload Needs Revision",
    message: "Your 'History Notes' needs some changes before approval.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    read: true,
  },
];

export const useNotifications = () => {
  const { mode } = useMode();
  const [notifications, setNotifications] = useState<Notification[]>(generateMockNotifications);

  // Filter notifications based on current mode
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const studentTypes: NotificationType[] = ["system", "purchase_confirmation", "saved_note_alert", "recommendation"];
      const contributorTypes: NotificationType[] = ["system", "new_sale", "upload_approved", "upload_rejected", "review_received", "earnings_milestone"];
      
      if (mode === "student") {
        return studentTypes.includes(notification.type);
      } else if (mode === "contributor") {
        return contributorTypes.includes(notification.type);
      }
      return notification.type === "system";
    });
  }, [notifications, mode]);

  const unreadCount = useMemo(() => {
    return filteredNotifications.filter((n) => !n.read).length;
  }, [filteredNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications: filteredNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearNotification,
  };
};
