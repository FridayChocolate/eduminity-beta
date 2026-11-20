import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMode } from "@/contexts/ModeContext";
import { NotificationItem } from "./NotificationItem";
import { Notification } from "./types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClear: (id: string) => void;
}

export const NotificationPanel = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
}: NotificationPanelProps) => {
  const { mode } = useMode();
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border shadow-xl z-50",
        "bg-card/95 backdrop-blur-xl",
        mode === "student" 
          ? "border-student-border shadow-glow-student/20" 
          : "border-creator-border shadow-glow-creator/20"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        mode === "student" ? "border-student-border" : "border-creator-border"
      )}>
        <div className="flex items-center gap-2">
          <Bell className={cn(
            "h-5 w-5",
            mode === "student" ? "text-student-primary" : "text-creator-primary"
          )} />
          <h3 className="font-semibold">Notifications</h3>
        </div>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs h-7 px-2 hover:bg-muted"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notification List */}
      <ScrollArea className="h-[400px]">
        <div className="p-2 space-y-1">
          <AnimatePresence mode="popLayout">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onClear={onClear}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-muted-foreground"
              >
                <Inbox className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs">You're all caught up!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className={cn(
          "p-3 border-t text-center",
          mode === "student" ? "border-student-border" : "border-creator-border"
        )}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs w-full",
              mode === "student" 
                ? "text-student-primary hover:text-student-primary/80" 
                : "text-creator-primary hover:text-creator-primary/80"
            )}
          >
            View all notifications
          </Button>
        </div>
      )}
    </motion.div>
  );
};
