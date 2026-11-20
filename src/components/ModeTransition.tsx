import { motion, AnimatePresence } from "framer-motion";
import { useMode } from "@/contexts/ModeContext";
import { Sparkles, BookOpen, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const modeConfig = {
  public: {
    icon: Sparkles,
    gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
    bgGradient: "from-violet-600/90 via-fuchsia-600/90 to-pink-600/90",
  },
  student: {
    icon: BookOpen,
    gradient: "from-cyan-400 via-blue-500 to-cyan-400",
    bgGradient: "from-cyan-600/90 via-blue-600/90 to-cyan-500/90",
  },
  contributor: {
    icon: Palette,
    gradient: "from-purple-500 via-pink-500 to-orange-400",
    bgGradient: "from-purple-600/90 via-pink-600/90 to-orange-500/90",
  },
};

export const ModeTransition = () => {
  const { isTransitioning, transitionMessage, mode } = useMode();
  const config = modeConfig[mode];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          {/* Animated gradient background */}
          <motion.div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              config.bgGradient
            )}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
          
          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/30"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 20,
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{
                  y: -20,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 1.5 + 1,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Content */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          >
            {/* Icon container with glow */}
            <motion.div
              className={cn(
                "w-24 h-24 rounded-3xl flex items-center justify-center",
                "bg-gradient-to-br shadow-2xl",
                config.gradient
              )}
              animate={{
                boxShadow: [
                  "0 0 30px rgba(255,255,255,0.3)",
                  "0 0 60px rgba(255,255,255,0.5)",
                  "0 0 30px rgba(255,255,255,0.3)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Icon className="h-12 w-12 text-white drop-shadow-lg" />
            </motion.div>

            {/* Message */}
            <motion.p
              className="text-2xl font-bold text-white tracking-wide drop-shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {transitionMessage}
            </motion.p>

            {/* Loading dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-white/80"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
