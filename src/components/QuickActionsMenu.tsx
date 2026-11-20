import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Upload, 
  HelpCircle, 
  BookOpen, 
  MessageSquare,
  Wallet,
  User,
  X,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useMode } from "@/contexts/ModeContext";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  to: string;
  color: string;
  bgColor: string;
}

export const QuickActionsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mode } = useMode();

  if (!user) return null;

  const actions: QuickAction[] = [
    {
      icon: Upload,
      label: "Upload Notes",
      description: "Share your study materials",
      to: "/app/upload-notes",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20 hover:bg-emerald-500/30"
    },
    {
      icon: HelpCircle,
      label: "Ask Question",
      description: "Get help from the community",
      to: "/app/questions",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20 hover:bg-blue-500/30"
    },
    {
      icon: BookOpen,
      label: "Study Materials",
      description: "Browse notes & resources",
      to: "/app/materials",
      color: "text-violet-400",
      bgColor: "bg-violet-500/20 hover:bg-violet-500/30"
    },
    {
      icon: MessageSquare,
      label: "Community",
      description: "Join discussions",
      to: "/app/community",
      color: "text-pink-400",
      bgColor: "bg-pink-500/20 hover:bg-pink-500/30"
    },
    {
      icon: Wallet,
      label: "Wallet",
      description: "Check your balance",
      to: "/app/wallet",
      color: "text-amber-400",
      bgColor: "bg-amber-500/20 hover:bg-amber-500/30"
    },
    {
      icon: User,
      label: "Profile",
      description: "View your profile",
      to: "/app/profile",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20 hover:bg-cyan-500/30"
    }
  ];

  const handleAction = (to: string) => {
    navigate(to);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Quick Actions Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-[101] w-72 sm:w-80"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/10 to-violet-500/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Quick Actions</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Jump to common tasks
                </p>
              </div>

              {/* Actions Grid */}
              <div className="p-3 grid grid-cols-2 gap-2">
                {actions.map((action, index) => (
                  <motion.button
                    key={action.to}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleAction(action.to)}
                    className={cn(
                      "flex flex-col items-start p-3 rounded-xl transition-all duration-200",
                      "border border-transparent hover:border-border/50",
                      action.bgColor
                    )}
                  >
                    <action.icon className={cn("h-5 w-5 mb-2", action.color)} />
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                      {action.description}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Mode-specific quick link */}
              <div className="px-3 pb-3">
                <button
                  onClick={() => handleAction(mode === "contributor" ? "/app/creator-studio" : "/app/student-dashboard")}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-primary/20 to-violet-500/20 border border-primary/20 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      mode === "contributor" 
                        ? "bg-gradient-to-br from-creator-primary to-creator-cyan" 
                        : "bg-student-accent"
                    )}>
                      <Sparkles className="h-4 w-4 text-background" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium text-foreground block">
                        {mode === "contributor" ? "Creator Studio" : "Learning Dashboard"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Go to your {mode === "contributor" ? "creator" : "student"} dashboard
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-[102]"
        initial={false}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
            "bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500",
            "hover:shadow-xl hover:scale-105",
            isOpen && "rotate-45"
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Plus className="h-6 w-6 text-white" />
          )}
        </Button>
      </motion.div>
    </>
  );
};
