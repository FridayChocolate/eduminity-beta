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
  const { user, loading, isContributor, activeMode, setActiveMode } = useAuth();
  const [mode, setModeState] = useState<AppMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("eduminity-active-mode") || localStorage.getItem(STORAGE_KEY);
      if (stored === "student" || stored === "contributor") {
        return stored;
      }
    }
    return "public";
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");

  // Follow the auth active mode. Contributors are not forced into Creator Studio.
  useEffect(() => {
    if (loading) return;

    if (!user) {
      setModeState("public");
      return;
    }

    if (activeMode === "contributor" && !isContributor) {
      setActiveMode("student");
      setModeState("student");
      return;
    }

    setModeState(activeMode);
  }, [user, loading, isContributor, activeMode, setActiveMode]);

  // Apply mode class to document
  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode);
    return () => {
      document.documentElement.removeAttribute("data-mode");
    };
  }, [mode]);

  const setMode = useCallback((newMode: AppMode) => {
    if (newMode === mode) return;
    if (newMode === "contributor" && !isContributor) return;

    if (newMode === "student" || newMode === "contributor") {
      setActiveMode(newMode);
    }

    setIsTransitioning(true);
    setTransitionMessage(transitionMessages[newMode]);

    setTimeout(() => {
      setModeState(newMode);
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionMessage("");
      }, 600);
    }, 300);
  }, [mode, isContributor, setActiveMode]);

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
