import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
  mode?: "fast" | "slow";
}

export const PageTransition = ({ children, mode = "fast" }: PageTransitionProps) => {
  const location = useLocation();
  
  const variants = {
    fast: {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: 0.2 },
    },
    slow: {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -16 },
      transition: { duration: 0.4 },
    },
  };

  const config = variants[mode];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={config.initial}
        animate={config.animate}
        exit={config.exit}
        transition={config.transition}
        className="motion-reduce:animate-none"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Simple fade wrapper for components
export const FadeIn = ({ 
  children, 
  delay = 0,
  className = "" 
}: { 
  children: ReactNode; 
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay, ease: "easeOut" }}
    className={`motion-reduce:animate-none ${className}`}
  >
    {children}
  </motion.div>
);

// Stagger container for lists
export const StaggerContainer = ({ 
  children,
  staggerDelay = 0.05,
  className = ""
}: { 
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ 
  children,
  className = ""
}: { 
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className={`motion-reduce:animate-none ${className}`}
  >
    {children}
  </motion.div>
);
