import { motion } from "framer-motion";
import { 
  FileText, Upload, ShoppingBag, Search, 
  Bookmark, MessageCircle, Star, LucideIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMode } from "@/contexts/ModeContext";

type EmptyStateType = 
  | "no-notes"
  | "no-uploads"
  | "no-purchases"
  | "no-results"
  | "no-saved"
  | "no-reviews"
  | "no-messages"
  | "custom";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const emptyStateConfig: Record<EmptyStateType, {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
}> = {
  "no-notes": {
    icon: FileText,
    title: "No notes yet",
    description: "Start exploring our collection of study materials",
    actionLabel: "Browse Notes",
  },
  "no-uploads": {
    icon: Upload,
    title: "No uploads yet",
    description: "Share your knowledge and start earning",
    actionLabel: "Upload Your First Note",
  },
  "no-purchases": {
    icon: ShoppingBag,
    title: "No purchases yet",
    description: "Find study materials that match your needs",
    actionLabel: "Explore Materials",
  },
  "no-results": {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search or filters",
    actionLabel: "Clear Filters",
  },
  "no-saved": {
    icon: Bookmark,
    title: "Nothing saved yet",
    description: "Save notes to access them quickly later",
    actionLabel: "Browse Notes",
  },
  "no-reviews": {
    icon: Star,
    title: "No reviews yet",
    description: "Be the first to share your experience",
    actionLabel: "Write a Review",
  },
  "no-messages": {
    icon: MessageCircle,
    title: "No messages yet",
    description: "Start a conversation with other students",
    actionLabel: "Browse Community",
  },
  custom: {
    icon: FileText,
    title: "Nothing here",
    description: "This section is empty",
  },
};

export const EmptyState = ({
  type = "custom",
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => {
  const { mode } = useMode();
  const config = emptyStateConfig[type];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionLabel = actionLabel || config.actionLabel;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      {/* Animated icon container */}
      <motion.div
        initial={{ y: 10 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "w-20 h-20 rounded-2xl flex items-center justify-center mb-4",
          "bg-muted/50 border border-border",
          mode === "student" && "border-student-border/50",
          mode === "contributor" && "border-creator-border/50"
        )}
      >
        <Icon className={cn(
          "h-10 w-10",
          mode === "student" ? "text-student-primary/60" : "text-creator-primary/60"
        )} />
      </motion.div>

      {/* Text content */}
      <motion.h3
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg font-semibold text-foreground mb-1"
      >
        {displayTitle}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-sm text-muted-foreground max-w-xs mb-4"
      >
        {displayDescription}
      </motion.p>

      {/* Action button */}
      {displayActionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={onAction}
            variant={mode === "contributor" ? "glow" : "default"}
            className="mt-2"
          >
            {displayActionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
