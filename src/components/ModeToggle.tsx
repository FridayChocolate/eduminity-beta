import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMode } from "@/contexts/ModeContext";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Palette, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const modeConfig = {
  student: {
    label: "Student",
    shortLabel: "Learn",
    icon: BookOpen,
    description: "Discover & learn",
    gradient: "from-cyan-400 via-blue-500 to-cyan-400",
    bgGradient: "from-cyan-500/20 to-blue-500/20",
    glowColor: "shadow-[0_0_20px_hsl(195,100%,50%,0.4)]",
    activeRing: "ring-cyan-400/50",
  },
  contributor: {
    label: "Creator",
    shortLabel: "Create",
    icon: Palette,
    description: "Upload & earn",
    gradient: "from-purple-500 via-pink-500 to-orange-400",
    bgGradient: "from-purple-500/20 via-pink-500/20 to-orange-400/20",
    glowColor: "shadow-[0_0_25px_hsl(280,90%,60%,0.4)]",
    activeRing: "ring-purple-400/50",
  },
  public: {
    label: "Explorer",
    shortLabel: "Explore",
    icon: Sparkles,
    description: "Browse freely",
    gradient: "from-violet-400 via-fuchsia-400 to-pink-400",
    bgGradient: "from-violet-500/20 to-pink-500/20",
    glowColor: "shadow-[0_0_20px_hsl(270,80%,60%,0.4)]",
    activeRing: "ring-violet-400/50",
  },
};

export const ModeToggle = () => {
  const { mode, setMode, isTransitioning } = useMode();
  const { user, canSwitchModes } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Strict portal rule: only users with "both" roles can toggle modes
  if (!user || !canSwitchModes) return null;

  const currentConfig = modeConfig[mode];
  const CurrentIcon = currentConfig.icon;

  const otherMode = mode === "student" ? "contributor" : "student";
  const otherConfig = modeConfig[otherMode];

  const handleToggle = () => {
    if (isTransitioning) return;
    setMode(otherMode);
    navigate(otherMode === "contributor" ? "/app/creator-studio" : "/app/student-dashboard");
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={handleToggle}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          disabled={isTransitioning}
          className={cn(
            "relative h-10 px-4 rounded-full overflow-hidden transition-all duration-300",
            "border-2 backdrop-blur-sm",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            mode === "student"
              ? "border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20 focus-visible:ring-cyan-400"
              : "border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 focus-visible:ring-purple-400",
            isTransitioning && "pointer-events-none opacity-70"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Animated background gradient */}
          <motion.div
            className={cn(
              "absolute inset-0 bg-gradient-to-r opacity-0",
              currentConfig.bgGradient
            )}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Content */}
          <div className="relative z-10 flex items-center gap-2">
            {/* Toggle indicator */}
            <div className="relative w-12 h-6 bg-muted/50 rounded-full p-0.5">
              <motion.div
                className={cn(
                  "absolute w-5 h-5 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br",
                  currentConfig.gradient
                )}
                animate={{
                  x: mode === "student" ? 0 : 24,
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              >
                <CurrentIcon className="h-3 w-3 text-white" />
              </motion.div>

              {/* Background icons */}
              <div className="absolute inset-0 flex items-center justify-between px-1.5">
                <BookOpen
                  className={cn(
                    "h-3 w-3 transition-opacity duration-300",
                    mode === "student" ? "opacity-0" : "opacity-40"
                  )}
                />
                <Palette
                  className={cn(
                    "h-3 w-3 transition-opacity duration-300",
                    mode === "contributor" ? "opacity-0" : "opacity-40"
                  )}
                />
              </div>
            </div>

            {/* Label */}
            <AnimatePresence mode="wait">
              <motion.span
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "text-sm font-semibold bg-gradient-to-r bg-clip-text text-transparent",
                  currentConfig.gradient
                )}
              >
                {currentConfig.shortLabel}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Glow effect */}
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full opacity-0",
              currentConfig.glowColor
            )}
            animate={{ opacity: isHovered ? 0.5 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex flex-col gap-1">
        <p className="font-medium">Switch to {otherConfig.label} Mode</p>
        <p className="text-xs text-muted-foreground">{otherConfig.description}</p>
      </TooltipContent>
    </Tooltip>
  );
};