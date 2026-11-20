import { motion } from "framer-motion";
import { Crown, TrendingUp, Star, CheckCircle, Award, Sparkles, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeType = 
  | "top-seller" 
  | "rising-star" 
  | "five-star-creator" 
  | "verified-contributor" 
  | "premium" 
  | "trending"
  | "elite"
  | "pioneer";

interface StatusBadgeProps {
  type: BadgeType;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showLabel?: boolean;
}

const badgeConfig: Record<BadgeType, {
  label: string;
  icon: typeof Crown;
  gradient: string;
  glow: string;
  textColor: string;
}> = {
  "top-seller": {
    label: "Top Seller",
    icon: Crown,
    gradient: "from-amber-400 via-yellow-500 to-orange-500",
    glow: "shadow-[0_0_20px_rgba(251,191,36,0.5)]",
    textColor: "text-amber-400"
  },
  "rising-star": {
    label: "Rising Star",
    icon: TrendingUp,
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    glow: "shadow-[0_0_20px_rgba(20,184,166,0.5)]",
    textColor: "text-emerald-400"
  },
  "five-star-creator": {
    label: "5-Star Creator",
    icon: Star,
    gradient: "from-violet-400 via-purple-500 to-fuchsia-500",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.5)]",
    textColor: "text-violet-400"
  },
  "verified-contributor": {
    label: "Verified",
    icon: CheckCircle,
    gradient: "from-blue-400 via-sky-500 to-cyan-500",
    glow: "shadow-[0_0_20px_rgba(56,189,248,0.5)]",
    textColor: "text-sky-400"
  },
  "premium": {
    label: "Premium",
    icon: Sparkles,
    gradient: "from-rose-400 via-pink-500 to-fuchsia-500",
    glow: "shadow-[0_0_25px_rgba(236,72,153,0.6)]",
    textColor: "text-pink-400"
  },
  "trending": {
    label: "Trending",
    icon: Flame,
    gradient: "from-orange-400 via-red-500 to-rose-500",
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.5)]",
    textColor: "text-orange-400"
  },
  "elite": {
    label: "Elite Creator",
    icon: Award,
    gradient: "from-indigo-400 via-purple-500 to-violet-600",
    glow: "shadow-[0_0_25px_rgba(139,92,246,0.6)]",
    textColor: "text-indigo-400"
  },
  "pioneer": {
    label: "Pioneer",
    icon: Zap,
    gradient: "from-yellow-400 via-amber-500 to-orange-600",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.5)]",
    textColor: "text-yellow-400"
  }
};

const sizeClasses = {
  sm: "h-5 px-2 text-[10px] gap-1",
  md: "h-6 px-2.5 text-xs gap-1.5",
  lg: "h-8 px-3 text-sm gap-2"
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4"
};

export function StatusBadge({ 
  type, 
  size = "md", 
  animated = true, 
  showLabel = true 
}: StatusBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={animated ? { scale: 0.9, opacity: 0 } : false}
      animate={animated ? { scale: 1, opacity: 1 } : false}
      whileHover={animated ? { scale: 1.05 } : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold",
        "bg-gradient-to-r",
        config.gradient,
        config.glow,
        sizeClasses[size],
        "text-white"
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </motion.div>
  );
}

// Animated premium banner component
export function PremiumBanner({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-xl p-4",
        "bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-violet-500/20",
        "border border-pink-500/30",
        className
      )}
    >
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "linear"
          }}
        />
      </div>
      
      <div className="relative flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 shadow-[0_0_20px_rgba(236,72,153,0.5)]">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
            Premium Creator
          </h4>
          <p className="text-xs text-muted-foreground">
            Exclusive benefits & priority support
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Neon glow wrapper for verified/premium users
export function NeonGlowWrapper({ 
  children, 
  isPremium = false,
  isVerified = false,
  className 
}: { 
  children: React.ReactNode;
  isPremium?: boolean;
  isVerified?: boolean;
  className?: string;
}) {
  if (!isPremium && !isVerified) return <>{children}</>;

  return (
    <div 
      className={cn(
        "relative",
        isPremium && "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-pink-500/40 before:via-purple-500/40 before:to-violet-500/40 before:blur-xl before:-z-10 before:animate-pulse",
        isVerified && !isPremium && "before:absolute before:inset-0 before:rounded-full before:bg-sky-500/30 before:blur-lg before:-z-10",
        className
      )}
    >
      {children}
    </div>
  );
}
