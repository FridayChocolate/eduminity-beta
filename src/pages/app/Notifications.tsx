import { useState } from "react";
import { ContributorLayout } from "@/layouts/ContributorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCircle, XCircle, Clock, DollarSign, Star, ChevronRight, Sparkles, Filter, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/components/contributor/NotificationBell";
import { PageBackButton } from "@/components/ui/page-back-button";

const notificationConfig: Record<NotificationType, { icon: typeof CheckCircle; color: string; bgColor: string; glowColor: string }> = {
  approved: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    glowColor: "shadow-emerald-500/20"
  },
  rejected: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    glowColor: "shadow-red-500/20"
  },
  pending: {
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    glowColor: "shadow-amber-500/20"
  },
  sale: {
    icon: DollarSign,
    color: "text-creator-cyan",
    bgColor: "bg-creator-cyan/20",
    glowColor: "shadow-creator-cyan/20"
  },
  review: {
    icon: Star,
    color: "text-creator-primary",
    bgColor: "bg-creator-primary/20",
    glowColor: "shadow-creator-primary/20"
  }
};

// Extended mock notifications
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "approved",
    title: "Note Approved! 🎉",
    message: "Your 'HSC Physics Complete Guide 2024' has been approved and is now live for students to purchase.",
    timestamp: "2 hours ago",
    read: false,
    link: "/app/my-uploads",
    noteId: "1"
  },
  {
    id: "2",
    type: "sale",
    title: "New Sale!",
    message: "Someone purchased your 'Organic Chemistry Master Notes' for ৳150. Keep up the great work!",
    timestamp: "5 hours ago",
    read: false,
    link: "/app/creator-earnings",
    noteId: "2"
  },
  {
    id: "3",
    type: "review",
    title: "New 5-Star Review ⭐",
    message: "A student left a 5-star review on 'HSC Physics Complete Guide 2024': 'Excellent notes, very helpful!'",
    timestamp: "1 day ago",
    read: true,
    link: "/app/creator-reviews",
    noteId: "1"
  },
  {
    id: "4",
    type: "pending",
    title: "Under Review",
    message: "Your 'ICT Practical Handbook' is now being reviewed by our team. Usually takes 24-48 hours.",
    timestamp: "1 day ago",
    read: true,
    link: "/app/my-uploads",
    noteId: "3"
  },
  {
    id: "5",
    type: "rejected",
    title: "Revision Needed",
    message: "Your 'Biology Diagrams Collection' needs some updates. Missing diagrams for chapters 5-8.",
    timestamp: "3 days ago",
    read: true,
    link: "/app/my-uploads",
    noteId: "4"
  },
  {
    id: "6",
    type: "sale",
    title: "Another Sale!",
    message: "Your 'HSC Physics Complete Guide 2024' was purchased for ৳200.",
    timestamp: "3 days ago",
    read: true,
    link: "/app/creator-earnings",
    noteId: "1"
  },
  {
    id: "7",
    type: "approved",
    title: "Note Approved!",
    message: "Your 'Organic Chemistry Master Notes' is now live and available for purchase.",
    timestamp: "5 days ago",
    read: true,
    link: "/app/my-uploads",
    noteId: "2"
  }
];

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<string>("all");

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    return n.type === activeTab;
  });

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    navigate(notification.link);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <ContributorLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <PageBackButton />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-creator-primary/20 to-creator-violet/20">
                  <Bell className="h-6 w-6 text-creator-primary" />
                </div>
                Notifications
              </h1>
              <p className="text-muted-foreground mt-1">
                Stay updated on your content and earnings
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="gap-2 border-creator-border/50 hover:bg-creator-primary/10 hover:text-creator-primary"
            >
              <Check className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="bg-muted/30 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-creator-primary/20 data-[state=active]:text-creator-primary">
              All
              <Badge variant="secondary" className="ml-2 bg-background/50 text-xs">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="data-[state=active]:bg-creator-primary/20 data-[state=active]:text-creator-primary">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-creator-primary/30 text-creator-primary text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sale" className="data-[state=active]:bg-creator-cyan/20 data-[state=active]:text-creator-cyan">
              Sales
            </TabsTrigger>
            <TabsTrigger value="review" className="data-[state=active]:bg-creator-primary/20 data-[state=active]:text-creator-primary">
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card className="creator-card">
              <CardContent className="p-0">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                      <Bell className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {activeTab === "unread" 
                        ? "You're all caught up! No unread notifications."
                        : "No notifications in this category yet."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-creator-border/20">
                    {filteredNotifications.map((notification, index) => {
                      const config = notificationConfig[notification.type];
                      const Icon = config.icon;

                      return (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            "flex items-start gap-4 p-4 sm:p-5 cursor-pointer",
                            "transition-all duration-300 hover:bg-muted/30",
                            !notification.read && "bg-creator-primary/5",
                            "animate-fade-in"
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Icon with glow */}
                          <div className={cn(
                            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
                            "transition-all duration-300",
                            config.bgColor,
                            !notification.read && `shadow-lg ${config.glowColor}`
                          )}>
                            <Icon className={cn("h-6 w-6", config.color)} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn(
                                "text-sm sm:text-base font-medium",
                                !notification.read && "text-foreground"
                              )}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-creator-primary to-creator-violet mt-1.5 animate-pulse" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-2">
                              {notification.timestamp}
                            </p>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="h-5 w-5 text-muted-foreground/50 flex-shrink-0 mt-1.5 transition-transform group-hover:translate-x-1" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ContributorLayout>
  );
};

export default Notifications;
