import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, CheckCircle, Bookmark, Sparkles, DollarSign, 
  XCircle, Star, Trophy, X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification, notificationConfig } from "./types";
import { useMode } from "@/contexts/ModeContext";

const iconMap = {
  Bell,
  CheckCircle,
  Bookmark,
  Sparkles,
  DollarSign,
  XCircle,
  Star,
  Trophy,
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClear: (id: string) => void;
}

export const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onClear 
}: NotificationItemProps) => {
  const { mode } = useMode();
  const config = notificationConfig[notification.type];
  const IconComponent = iconMap[config.icon as keyof typeof iconMap] || Bell;

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      whileHover={{ scale: 1.01 }}
      onClick={handleClick}
      className={cn(
        "relative p-3 rounded-lg cursor-pointer transition-all duration-200 group",
        "border border-transparent",
        notification.read 
          ? "bg-muted/30 hover:bg-muted/50" 
          : cn(
              "bg-card/80",
              mode === "student" 
                ? "border-student-primary/20 hover:border-student-primary/40 hover:bg-student-hover" 
                : "border-creator-primary/20 hover:border-creator-primary/40 hover:bg-creator-hover"
            )
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute top-3 left-1 w-2 h-2 rounded-full",
            mode === "student" ? "bg-student-primary" : "bg-creator-primary"
          )}
        />
      )}

      <div className="flex items-start gap-3 pl-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
          mode === "student" 
            ? "bg-student-primary/10" 
            : "bg-creator-primary/10"
        )}>
          <IconComponent className={cn("h-4 w-4", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium truncate",
            notification.read ? "text-muted-foreground" : "text-foreground"
          )}>
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
          </p>
        </div>

        {/* Clear button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear(notification.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
};
