import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMode } from "@/contexts/ModeContext";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const AnimatedCounter = ({
  value,
  prefix = "",
  suffix = "",
  duration = 1000,
  decimals = 0,
  className,
  size = "md",
}: AnimatedCounterProps) => {
  const { mode } = useMode();
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();

    setIsAnimating(true);

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeProgress;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const sizeClasses = {
    sm: "text-lg font-semibold",
    md: "text-2xl font-bold",
    lg: "text-3xl font-bold",
    xl: "text-4xl font-black",
  };

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <motion.span
      className={cn(
        sizeClasses[size],
        "tabular-nums",
        isAnimating && "transition-transform",
        className
      )}
      animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </motion.span>
  );
};

// Stats card with animated counter
interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number; // positive or negative percentage
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard = ({
  label,
  value,
  prefix,
  suffix,
  trend,
  icon,
  className,
}: StatCardProps) => {
  const { mode } = useMode();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "p-4 rounded-xl border bg-card transition-all",
        mode === "student" 
          ? "border-student-border/50 hover:border-student-primary/30 hover:shadow-glow-student/20" 
          : "border-creator-border/50 hover:border-creator-primary/30 hover:shadow-glow-creator/20",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon && (
          <span className={cn(
            "p-1.5 rounded-lg",
            mode === "student" ? "bg-student-primary/10" : "bg-creator-primary/10"
          )}>
            {icon}
          </span>
        )}
      </div>
      
      <AnimatedCounter
        value={value}
        prefix={prefix}
        suffix={suffix}
        size="lg"
        className={cn(
          mode === "student" ? "text-student-primary" : "text-creator-primary"
        )}
      />

      {trend !== undefined && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "mt-1 text-xs font-medium flex items-center gap-1",
            trend >= 0 ? "text-green-500" : "text-red-500"
          )}
        >
          <span>{trend >= 0 ? "↑" : "↓"}</span>
          <span>{Math.abs(trend)}%</span>
          <span className="text-muted-foreground">vs last period</span>
        </motion.div>
      )}
    </motion.div>
  );
};
