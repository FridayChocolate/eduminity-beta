import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMode } from "@/contexts/ModeContext";

interface ProgressIndicatorProps {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export const ProgressIndicator = ({
  progress,
  size = "md",
  showLabel = false,
  className,
}: ProgressIndicatorProps) => {
  const { mode } = useMode();
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "w-full bg-muted rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            mode === "student"
              ? "bg-gradient-to-r from-student-primary to-student-secondary"
              : "bg-gradient-to-r from-creator-primary via-creator-secondary to-creator-tertiary"
          )}
        />
      </div>
      {showLabel && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground mt-1 block text-right"
        >
          {clampedProgress}%
        </motion.span>
      )}
    </div>
  );
};

interface UploadProgressProps {
  progress: number;
  fileName?: string;
  status?: "uploading" | "processing" | "complete" | "error";
}

export const UploadProgress = ({
  progress,
  fileName,
  status = "uploading",
}: UploadProgressProps) => {
  const { mode } = useMode();

  const statusMessages = {
    uploading: "Uploading...",
    processing: "Processing...",
    complete: "Complete!",
    error: "Upload failed",
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {fileName || "Uploading file..."}
        </span>
        <span className={cn(
          "text-xs",
          status === "complete" && "text-green-500",
          status === "error" && "text-destructive",
          status === "uploading" || status === "processing" ? "text-muted-foreground" : ""
        )}>
          {statusMessages[status]}
        </span>
      </div>
      
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "linear" }}
          className={cn(
            "h-full rounded-full relative",
            status === "error" 
              ? "bg-destructive" 
              : status === "complete"
                ? "bg-green-500"
                : mode === "student"
                  ? "bg-gradient-to-r from-student-primary to-student-secondary"
                  : "bg-gradient-to-r from-creator-primary to-creator-secondary"
          )}
        >
          {/* Shimmer effect while uploading */}
          {(status === "uploading" || status === "processing") && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Pulsing indicator for active states
export const PulsingIndicator = ({ 
  active = true,
  size = "sm",
  className,
}: { 
  active?: boolean;
  size?: "xs" | "sm" | "md";
  className?: string;
}) => {
  const { mode } = useMode();
  
  const sizeClasses = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-3 h-3",
  };

  if (!active) return null;

  return (
    <span className={cn("relative inline-flex", className)}>
      <span className={cn(
        "absolute inline-flex rounded-full opacity-75 animate-ping",
        sizeClasses[size],
        mode === "student" ? "bg-student-primary" : "bg-creator-primary"
      )} />
      <span className={cn(
        "relative inline-flex rounded-full",
        sizeClasses[size],
        mode === "student" ? "bg-student-primary" : "bg-creator-primary"
      )} />
    </span>
  );
};
