import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, ShoppingBag, Bookmark, TrendingUp, 
  Clock, ChevronRight, RefreshCw 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "viewed" | "purchased" | "saved";
  title: string;
  subject: string;
  timestamp: Date;
  price?: number;
}

const mockActivity: ActivityItem[] = [
  {
    id: "1",
    type: "viewed",
    title: "Advanced Calculus Notes",
    subject: "Mathematics",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    type: "purchased",
    title: "Organic Chemistry Guide",
    subject: "Chemistry",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    price: 150,
  },
  {
    id: "3",
    type: "saved",
    title: "Physics Problem Sets",
    subject: "Physics",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "4",
    type: "viewed",
    title: "Biology Cell Structure",
    subject: "Biology",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "5",
    type: "purchased",
    title: "English Literature Essays",
    subject: "English",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    price: 200,
  },
];

const suggestedActions = [
  { icon: TrendingUp, text: "Explore trending notes", action: "/app/materials" },
  { icon: Bookmark, text: "Check your saved items", action: "/app/saved" },
  { icon: ShoppingBag, text: "Browse by subject", action: "/app/materials" },
];

const activityIcons = {
  viewed: Eye,
  purchased: ShoppingBag,
  saved: Bookmark,
};

const activityColors = {
  viewed: "text-blue-500 bg-blue-500/10",
  purchased: "text-green-500 bg-green-500/10",
  saved: "text-amber-500 bg-amber-500/10",
};

export const StudentActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>(mockActivity);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh with animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Auto-refresh visual effect every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 500);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="mode-card transition-mode overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-student-primary" />
            Recent Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-8 w-8"
          >
            <RefreshCw className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isRefreshing && "animate-spin"
            )} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Activity List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {activities.slice(0, 5).map((activity, index) => {
              const Icon = activityIcons[activity.type];
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-all",
                    "hover:bg-student-hover cursor-pointer group"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    activityColors[activity.type]
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-student-primary transition-colors">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{activity.subject}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                    </p>
                  </div>
                  {activity.price && (
                    <span className="text-xs font-semibold text-green-500">
                      ৳{activity.price}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Suggested Actions */}
        <div className="pt-4 border-t border-student-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Suggested Next Steps
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedActions.map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                  "bg-student-primary/10 text-student-primary",
                  "hover:bg-student-primary/20 transition-colors"
                )}
              >
                <action.icon className="h-3 w-3" />
                {action.text}
              </motion.button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
