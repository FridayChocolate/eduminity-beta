import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export type AppMode = "public" | "student" | "contributor";

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isTransitioning: boolean;
  transitionMessage: string;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

const transitionMessages: Record<AppMode, string> = {
  public: "Exploring Eduminity",
  student: "Entering Learning Mode",
  contributor: "Entering Creator Studio",
};

const STORAGE_KEY = "eduminity-mode";

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userRole, loading } = useAuth();
  const [mode, setModeState] = useState<AppMode>(() => {
    // Try to restore mode from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "student" || stored === "contributor") {
        return stored;
      }
    }
    return "public";
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");

  // Auto-set mode based on user role on initial login
  useEffect(() => {
    if (loading) return;

    if (!user) {
      setModeState("public");
      localStorage.removeItem(STORAGE_KEY);
    } else {
      // Check if we have a stored preference
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "student" || stored === "contributor") {
        // Validate that user can access the stored mode
        if (stored === "contributor" && userRole !== "contributor") {
          setModeState("student");
          localStorage.setItem(STORAGE_KEY, "student");
        } else {
          setModeState(stored);
        }
      } else {
        // Set based on role
        if (userRole === "contributor") {
          setModeState("contributor");
          localStorage.setItem(STORAGE_KEY, "contributor");
        } else {
          setModeState("student");
          localStorage.setItem(STORAGE_KEY, "student");
        }
      }
    }
  }, [user, userRole, loading]);

  // Apply mode class to document
  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode);
    return () => {
      document.documentElement.removeAttribute("data-mode");
    };
  }, [mode]);

  const setMode = useCallback((newMode: AppMode) => {
    if (newMode === mode) return;
    
    setIsTransitioning(true);
    setTransitionMessage(transitionMessages[newMode]);
    
    // Save preference to localStorage
    if (newMode !== "public") {
      localStorage.setItem(STORAGE_KEY, newMode);
    }
    
    setTimeout(() => {
      setModeState(newMode);
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionMessage("");
      }, 600);
    }, 300);
  }, [mode]);

  return (
    <ModeContext.Provider value={{ mode, setMode, isTransitioning, transitionMessage }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
};
