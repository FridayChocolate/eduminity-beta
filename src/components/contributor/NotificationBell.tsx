import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, XCircle, Clock, DollarSign, Star, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export type NotificationType = "approved" | "rejected" | "pending" | "sale" | "review";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link: string;
  noteId?: string;
}

const notificationConfig: Record<NotificationType, { icon: typeof CheckCircle; color: string; bgColor: string }> = {
  approved: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20"
  },
  rejected: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/20"
  },
  pending: {
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20"
  },
  sale: {
    icon: DollarSign,
    color: "text-creator-cyan",
    bgColor: "bg-creator-cyan/20"
  },
  review: {
    icon: Star,
    color: "text-creator-primary",
    bgColor: "bg-creator-primary/20"
  }
};

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "approved",
    title: "Note Approved! 🎉",
    message: "Your 'HSC Physics Complete Guide 2024' has been approved and is now live.",
    timestamp: "2 hours ago",
    read: false,
    link: "/app/my-uploads",
    noteId: "1"
  },
  {
    id: "2",
    type: "sale",
    title: "New Sale!",
    message: "Someone purchased your 'Organic Chemistry Master Notes' for ৳150.",
    timestamp: "5 hours ago",
    read: false,
    link: "/app/creator-earnings",
    noteId: "2"
  },
  {
    id: "3",
    type: "review",
    title: "New Review",
    message: "You received a 5-star review on 'HSC Physics Complete Guide 2024'.",
    timestamp: "1 day ago",
    read: true,
    link: "/app/creator-reviews",
    noteId: "1"
  },
  {
    id: "4",
    type: "pending",
    title: "Under Review",
    message: "Your 'ICT Practical Handbook' is now being reviewed by our team.",
    timestamp: "1 day ago",
    read: true,
    link: "/app/my-uploads",
    noteId: "3"
  },
  {
    id: "5",
    type: "rejected",
    title: "Revision Needed",
    message: "Your 'Biology Diagrams Collection' needs some updates. Click to see feedback.",
    timestamp: "3 days ago",
    read: true,
    link: "/app/my-uploads",
    noteId: "4"
  }
];

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    setIsOpen(false);
    navigate(notification.link);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative h-10 w-10 rounded-xl transition-all duration-300",
          "hover:bg-creator-primary/10 hover:text-creator-primary",
          isOpen && "bg-creator-primary/10 text-creator-primary"
        )}
      >
        <Bell className={cn(
          "h-5 w-5 transition-transform duration-300",
          isOpen && "scale-110"
        )} />
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-creator-primary to-creator-violet text-[10px] font-bold flex items-center justify-center text-background animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      <div className={cn(
        "absolute right-0 top-full mt-2 w-80 sm:w-96 z-50",
        "transition-all duration-300 ease-out origin-top-right",
        isOpen 
          ? "opacity-100 scale-100 translate-y-0" 
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      )}>
        <div className="rounded-2xl border border-creator-border/50 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-creator-border/30">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-creator-primary" />
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-creator-primary/20 text-creator-primary text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-muted-foreground hover:text-creator-primary h-auto py-1"
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <ScrollArea className="max-h-[400px]">
            <div className="py-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification, index) => {
                  const config = notificationConfig[notification.type];
                  const Icon = config.icon;

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 cursor-pointer",
                        "transition-all duration-200 hover:bg-muted/50",
                        !notification.read && "bg-creator-primary/5",
                        "animate-fade-in"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Icon */}
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                        config.bgColor
                      )}>
                        <Icon className={cn("h-5 w-5", config.color)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "text-sm font-medium",
                            !notification.read && "text-foreground"
                          )}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-creator-primary mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {notification.timestamp}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0 mt-1" />
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-creator-border/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/app/notifications");
                }}
                className="w-full text-sm text-muted-foreground hover:text-creator-primary"
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
