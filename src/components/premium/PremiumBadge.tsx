import { Crown, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TierType = "free" | "pro" | "elite";

interface PremiumBadgeProps {
  tier: TierType;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const tierConfig = {
  free: {
    label: "Free",
    icon: null,
    className: "bg-muted text-muted-foreground border-border",
  },
  pro: {
    label: "Pro",
    icon: Sparkles,
    className: "bg-gradient-to-r from-violet-500 to-cyan-500 text-white border-0 shadow-lg shadow-violet-500/25",
  },
  elite: {
    label: "Elite",
    icon: Crown,
    className: "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/25",
  },
};

const sizeClasses = {
  sm: "text-[10px] px-1.5 py-0 h-5",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-3 py-1",
};

export const PremiumBadge = ({ tier, size = "md", showIcon = true, className }: PremiumBadgeProps) => {
  const config = tierConfig[tier];
  const IconComponent = config.icon;

  if (tier === "free") {
    return null; // Don't show badge for free tier
  }

  return (
    <Badge 
      className={cn(
        "font-semibold transition-all",
        config.className,
        sizeClasses[size],
        tier === "elite" && "animate-pulse",
        className
      )}
    >
      {showIcon && IconComponent && (
        <IconComponent className={cn(
          "mr-1",
          size === "sm" && "h-3 w-3",
          size === "md" && "h-3.5 w-3.5",
          size === "lg" && "h-4 w-4"
        )} />
      )}
      {config.label}
    </Badge>
  );
};

// Export for use in profile components
export const getPremiumGlowClass = (tier: TierType): string => {
  switch (tier) {
    case "pro":
      return "shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]";
    case "elite":
      return "shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]";
    default:
      return "";
  }
};
