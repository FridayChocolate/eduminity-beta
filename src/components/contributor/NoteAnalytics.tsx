import { TrendingUp, TrendingDown, Minus, Eye, ShoppingCart, Star, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteAnalyticsProps {
  totalSales: number;
  totalRevenue: number;
  views: number;
  conversionRate: number;
  averageRating: number;
  reviewCount: number;
  lastSaleDate: string | null;
  trend: "up" | "down" | "flat";
  trendPercentage: number;
}

export const NoteAnalytics = ({
  totalSales,
  totalRevenue,
  views,
  conversionRate,
  averageRating,
  reviewCount,
  lastSaleDate,
  trend,
  trendPercentage,
}: NoteAnalyticsProps) => {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-muted-foreground";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-background/50 rounded-xl border border-creator-border/30">
      {/* Total Sales */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <ShoppingCart className="h-3.5 w-3.5" />
          <span className="text-[10px] uppercase tracking-wide">Sales</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-foreground">{totalSales}</span>
          <div className={cn("flex items-center gap-0.5 text-xs", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            <span>{trendPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <DollarSign className="h-3.5 w-3.5" />
          <span className="text-[10px] uppercase tracking-wide">Revenue</span>
        </div>
        <span className="text-xl font-bold text-creator-cyan">৳{totalRevenue.toLocaleString()}</span>
      </div>

      {/* Conversion Rate */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <BarChart3 className="h-3.5 w-3.5" />
          <span className="text-[10px] uppercase tracking-wide">Conversion</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-foreground">{conversionRate.toFixed(1)}%</span>
          <span className="text-[10px] text-muted-foreground">({views} views)</span>
        </div>
      </div>

      {/* Rating */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Star className="h-3.5 w-3.5" />
          <span className="text-[10px] uppercase tracking-wide">Rating</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-amber-400">{averageRating.toFixed(1)}</span>
          <span className="text-[10px] text-muted-foreground">({reviewCount} reviews)</span>
        </div>
      </div>

      {/* Views */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          <span className="text-[10px] uppercase tracking-wide">Views</span>
        </div>
        <span className="text-xl font-bold text-foreground">{views.toLocaleString()}</span>
      </div>

      {/* Last Sale */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span className="text-[10px] uppercase tracking-wide">Last Sale</span>
        </div>
        <span className="text-sm font-medium text-foreground">
          {lastSaleDate || "No sales yet"}
        </span>
      </div>
    </div>
  );
};
