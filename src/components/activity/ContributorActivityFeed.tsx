import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, DollarSign, Star, TrendingUp, 
  Clock, ChevronRight, RefreshCw, Zap 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface CreatorActivity {
  id: string;
  type: "upload" | "sale" | "review";
  title: string;
  detail: string;
  timestamp: Date;
  amount?: number;
  rating?: number;
}

const mockCreatorActivity: CreatorActivity[] = [
  {
    id: "1",
    type: "sale",
    title: "New Sale!",
    detail: "Calculus Complete Guide",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    amount: 299,
  },
  {
    id: "2",
    type: "review",
    title: "New Review",
    detail: "Physics Notes Pack",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    rating: 5,
  },
  {
    id: "3",
    type: "upload",
    title: "Upload Approved",
    detail: "Chemistry Chapter 10",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "4",
    type: "sale",
    title: "New Sale!",
    detail: "Biology Study Guide",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    amount: 199,
  },
  {
    id: "5",
    type: "sale",
    title: "New Sale!",
    detail: "Math Formula Sheet",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    amount: 99,
  },
];

const activityIcons = {
  upload: Upload,
  sale: DollarSign,
  review: Star,
};

const activityColors = {
  upload: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  sale: "text-green-500 bg-green-500/10 border-green-500/30",
  review: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
};

export const ContributorActivityFeed = () => {
  const [activities] = useState<CreatorActivity[]>(mockCreatorActivity);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pulseIndex, setPulseIndex] = useState<number | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Auto-refresh visual effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 500);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Pulse effect on random items to simulate activity
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex(Math.floor(Math.random() * activities.length));
      setTimeout(() => setPulseIndex(null), 2000);
    }, 8000);

    return () => clearInterval(interval);
  }, [activities.length]);

  // Calculate quick stats
  const todaySales = activities
    .filter((a) => a.type === "sale" && a.timestamp > new Date(Date.now() - 1000 * 60 * 60 * 24))
    .reduce((sum, a) => sum + (a.amount || 0), 0);

  const recentReviews = activities.filter((a) => a.type === "review").length;

  return (
    <Card className="mode-card transition-mode overflow-hidden border-creator-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-creator-primary" />
            <span className="mode-text-gradient">Live Activity</span>
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

        {/* Quick Stats */}
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">
              Today: <span className="font-semibold text-green-500">৳{todaySales}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-yellow-500">{recentReviews}</span> reviews
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const isPulsing = pulseIndex === index;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: isPulsing ? 1.02 : 1,
                }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative flex items-center gap-3 p-2.5 rounded-lg transition-all",
                  "hover:bg-creator-hover cursor-pointer group border",
                  activityColors[activity.type].includes("border") 
                    ? activityColors[activity.type].split(" ")[2]
                    : "border-transparent",
                  isPulsing && "ring-2 ring-creator-primary/30"
                )}
              >
                {/* Glow effect for sales */}
                {activity.type === "sale" && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/5 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isPulsing ? 1 : 0 }}
                  />
                )}

                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border",
                  activityColors[activity.type]
                )}>
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-creator-primary transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="truncate">{activity.detail}</span>
                    <span>•</span>
                    <span className="flex-shrink-0">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </span>
                  </p>
                </div>

                {activity.amount && (
                  <motion.span
                    animate={isPulsing ? { scale: [1, 1.1, 1] } : {}}
                    className="text-sm font-bold text-green-500"
                  >
                    +৳{activity.amount}
                  </motion.span>
                )}

                {activity.rating && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: activity.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                )}

                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* View All Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "w-full mt-3 py-2 rounded-lg text-sm font-medium",
            "bg-gradient-to-r from-creator-primary/10 via-creator-secondary/10 to-creator-tertiary/10",
            "text-creator-primary hover:from-creator-primary/20 hover:via-creator-secondary/20 hover:to-creator-tertiary/20",
            "transition-all border border-creator-border/50"
          )}
        >
          <span className="flex items-center justify-center gap-2">
            <TrendingUp className="h-4 w-4" />
            View Full Analytics
          </span>
        </motion.button>
      </CardContent>
    </Card>
  );
};
