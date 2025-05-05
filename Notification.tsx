import React, { useEffect, useRef } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  onDismiss: (id: string) => void;
  onClose: (id: string) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "success":
      return <CheckCircle className="text-primary" />;
    case "error":
      return <AlertCircle className="text-destructive" />;
    case "info":
      return <Info className="text-blue-500" />;
    case "warning":
      return <AlertCircle className="text-yellow-500" />;
    default:
      return <CheckCircle className="text-primary" />;
  }
};

const getBorderClass = (type: NotificationType) => {
  switch (type) {
    case "success":
      return "border-primary";
    case "error":
      return "border-destructive";
    case "info":
      return "border-blue-500";
    case "warning":
      return "border-yellow-500";
    default:
      return "border-primary";
  }
};

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  onDismiss,
  onClose,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto dismiss after 5 seconds
    timerRef.current = setTimeout(() => {
      onDismiss(id);
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [id, onDismiss]);

  return (
    <div 
      className={cn(
        "notification border-l-4 transform transition-all duration-300 ease-out translate-x-0 opacity-100",
        getBorderClass(type)
      )}
    >
      <div className="mr-3">
        {getNotificationIcon(type)}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-neutral-400 text-xs">{message}</p>
      </div>
      <button 
        className="text-neutral-500 hover:text-neutral-300"
        onClick={() => onClose(id)}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Notification;
