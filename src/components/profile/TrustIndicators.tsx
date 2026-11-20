import { motion } from "framer-motion";
import { Star, ShoppingCart, Calendar, Shield, MessageSquare, Eye, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustIndicator {
  label: string;
  value: string | number;
  icon: typeof Star;
  color: string;
  bgColor: string;
}

interface TrustIndicatorsProps {
  rating: number;
  reviewCount: number;
  totalSales: number;
  memberSince: string;
  verificationStatus: "pending" | "verified" | "not-verified";
  totalViews?: number;
  totalDownloads?: number;
  layout?: "grid" | "row";
  className?: string;
}

export function TrustIndicators({
  rating,
  reviewCount,
  totalSales,
  memberSince,
  verificationStatus,
  totalViews,
  totalDownloads,
  layout = "grid",
  className
}: TrustIndicatorsProps) {
  const indicators: TrustIndicator[] = [
    {
      label: "Rating",
      value: rating.toFixed(1),
      icon: Star,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10"
    },
    {
      label: "Reviews",
      value: reviewCount.toLocaleString(),
      icon: MessageSquare,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      label: "Sales",
      value: totalSales.toLocaleString(),
      icon: ShoppingCart,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    },
    {
      label: "Member Since",
      value: memberSince,
      icon: Calendar,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10"
    },
    {
      label: "Status",
      value: verificationStatus === "verified" ? "Verified" : verificationStatus === "pending" ? "Pending" : "Not Verified",
      icon: Shield,
      color: verificationStatus === "verified" ? "text-sky-400" : verificationStatus === "pending" ? "text-amber-400" : "text-muted-foreground",
      bgColor: verificationStatus === "verified" ? "bg-sky-500/10" : verificationStatus === "pending" ? "bg-amber-500/10" : "bg-muted/30"
    }
  ];

  if (totalViews !== undefined) {
    indicators.push({
      label: "Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10"
    });
  }

  if (totalDownloads !== undefined) {
    indicators.push({
      label: "Downloads",
      value: totalDownloads.toLocaleString(),
      icon: Download,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10"
    });
  }

  return (
    <div 
      className={cn(
        layout === "grid" 
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" 
          : "flex flex-wrap gap-4",
        className
      )}
    >
      {indicators.map((indicator, index) => (
        <motion.div
          key={indicator.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            "rounded-xl p-3 border border-border/50",
            indicator.bgColor,
            "backdrop-blur-sm"
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <indicator.icon className={cn("h-4 w-4", indicator.color)} />
            <span className="text-xs text-muted-foreground">{indicator.label}</span>
          </div>
          <p className={cn("text-lg font-bold", indicator.label === "Rating" && "flex items-center gap-1")}>
            {indicator.value}
            {indicator.label === "Rating" && (
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            )}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// Compact trust strip for use in cards
export function TrustStrip({
  rating,
  reviewCount,
  sales,
  className
}: {
  rating: number;
  reviewCount: number;
  sales: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4 text-sm", className)}>
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
        <span className="font-semibold">{rating.toFixed(1)}</span>
        <span className="text-muted-foreground">({reviewCount})</span>
      </div>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-1">
        <ShoppingCart className="h-4 w-4 text-emerald-400" />
        <span className="font-semibold">{sales}</span>
        <span className="text-muted-foreground">sales</span>
      </div>
    </div>
  );
}
