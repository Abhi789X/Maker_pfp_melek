import React, { createContext, useState, useContext, useCallback } from "react";
import Notification, { NotificationType } from "@/components/Notification";
import { nanoid } from "nanoid";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  dismissed?: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  showNotification: (type: NotificationType, title: string, message: string) => void;
  dismissNotification: (id: string) => void;
  closeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showNotification = useCallback((type: NotificationType, title: string, message: string) => {
    const id = nanoid();
    setNotifications((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, dismissed: true } : notification
      )
    );
    
    // Remove the notification after animation completes
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, 300);
  }, []);

  const closeNotification = useCallback((id: string) => {
    dismissNotification(id);
  }, [dismissNotification]);

  return (
    <NotificationContext.Provider
      value={{ notifications, showNotification, dismissNotification, closeNotification }}
    >
      {children}
      <div className="fixed bottom-4 right-4 w-80 z-50">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            id={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onDismiss={dismissNotification}
            onClose={closeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
