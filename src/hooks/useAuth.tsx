import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "student" | "contributor" | "both" | null;
export type ActiveMode = "student" | "contributor";

const ADMIN_EMAIL = "business.neurovane@gmail.com";
const ACTIVE_MODE_KEY = "eduminity-active-mode";
const LEGACY_MODE_KEY = "eduminity-mode";

const STUDENT_HOME = "/app/student-dashboard";
const CONTRIBUTOR_HOME = "/app/creator-studio";

// Module-level cache so navigating between pages never flashes or loops
let cachedSession: Session | null = null;
let cachedUser: User | null = null;
let cachedRole: UserRole = null;
let cachedIsContributor = false;
let hasInitialized = false;

type NavigateFn = (path: string) => void;
let navigateImpl: NavigateFn | null = null;

const modeListeners = new Set<() => void>();

const readStoredActiveMode = (): ActiveMode => {
  if (typeof window === "undefined") return "student";
  const stored = localStorage.getItem(ACTIVE_MODE_KEY) || localStorage.getItem(LEGACY_MODE_KEY);
  return stored === "contributor" ? "contributor" : "student";
};

let cachedActiveMode: ActiveMode = readStoredActiveMode();

const emitAuthCache = () => {
  modeListeners.forEach((listener) => listener());
};

const persistActiveMode = (mode: ActiveMode) => {
  cachedActiveMode = mode;
  localStorage.setItem(ACTIVE_MODE_KEY, mode);
  localStorage.setItem(LEGACY_MODE_KEY, mode);
  emitAuthCache();
};

export const registerAuthNavigator = (fn: NavigateFn | null) => {
  navigateImpl = fn;
};

/** Mount inside the router so toggleMode can change routes. */
export const AuthNavigatorBridge = () => {
  const navigate = useNavigate();

  useEffect(() => {
    registerAuthNavigator(navigate);
    return () => registerAuthNavigator(null);
  }, [navigate]);

  return null;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [session, setSession] = useState<Session | null>(cachedSession);
  const [userRole, setUserRole] = useState<UserRole>(cachedRole);
  const [isContributor, setIsContributor] = useState(cachedIsContributor);
  const [activeMode, setActiveModeState] = useState<ActiveMode>(cachedActiveMode);
  const [loading, setLoading] = useState(!hasInitialized);
  const { toast } = useToast();

  useEffect(() => {
    const syncFromCache = () => {
      setSession(cachedSession);
      setUser(cachedUser);
      setUserRole(cachedRole);
      setIsContributor(cachedIsContributor);
      setActiveModeState(cachedActiveMode);
    };
    modeListeners.add(syncFromCache);
    return () => {
      modeListeners.delete(syncFromCache);
    };
  }, []);

  const fetchUserRole = async (currentUser: User): Promise<UserRole> => {
    try {
      if (currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        return "both";
      }

      const { data, error } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id);

      if (!error && data && data.length > 0) {
        const roles = data.map((row: any) => String(row.role || "").toLowerCase());
        const hasBoth = roles.includes("both");
        const hasStudent = roles.includes("student");
        const hasCreator = roles.includes("contributor") || roles.includes("creator");

        if (hasBoth || (hasStudent && hasCreator)) return "both";
        if (hasCreator) return "contributor";
        if (hasStudent) return "student";
      }

      const metaRole = String(currentUser.user_metadata?.role || "").toLowerCase();
      if (metaRole === "both") return "both";
      if (metaRole === "contributor" || metaRole === "creator") return "contributor";

      return "student";
    } catch {
      return "student";
    }
  };

  const fetchIsContributor = async (currentUser: User, role: UserRole): Promise<boolean> => {
    if (currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return true;
    if (role === "contributor" || role === "both") return true;

    try {
      const { data, error } = await (supabase as any)
        .from("contributor_profiles")
        .select("user_id")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (!error && data) return true;
    } catch {
      // Role fallback already applied above
    }

    return false;
  };

  useEffect(() => {
    let mounted = true;

    const syncSession = async (nextSession: Session | null) => {
      cachedSession = nextSession;
      cachedUser = nextSession?.user ?? null;

      if (nextSession?.user) {
        const role = await fetchUserRole(nextSession.user);
        const contributor = await fetchIsContributor(nextSession.user, role);
        cachedRole = role;
        cachedIsContributor = contributor;

        if (cachedActiveMode === "contributor" && !contributor) {
          cachedActiveMode = "student";
          localStorage.setItem(ACTIVE_MODE_KEY, "student");
          localStorage.setItem(LEGACY_MODE_KEY, "student");
        }
      } else {
        cachedRole = null;
        cachedIsContributor = false;
      }

      hasInitialized = true;
      emitAuthCache();

      if (mounted) {
        setSession(cachedSession);
        setUser(cachedUser);
        setUserRole(cachedRole);
        setIsContributor(cachedIsContributor);
        setActiveModeState(cachedActiveMode);
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      syncSession(initialSession);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      syncSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error && !error.message.toLowerCase().includes("session missing")) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch {
      // Ignore network or missing-session errors and force local logout
    } finally {
      cachedSession = null;
      cachedUser = null;
      cachedRole = null;
      cachedIsContributor = false;
      cachedActiveMode = "student";
      localStorage.removeItem(ACTIVE_MODE_KEY);
      localStorage.removeItem(LEGACY_MODE_KEY);
      setSession(null);
      setUser(null);
      setUserRole(null);
      setIsContributor(false);
      setActiveModeState("student");
      emitAuthCache();

      if (navigateImpl) {
        navigateImpl("/");
      } else {
        window.location.assign("/");
      }
    }
  };

  const setActiveMode = useCallback((mode: ActiveMode) => {
    if (mode === "contributor" && !cachedIsContributor) return;
    if (cachedActiveMode === mode) return;
    persistActiveMode(mode);
  }, []);

  const toggleMode = useCallback(() => {
    if (!cachedIsContributor) return;
    const next: ActiveMode = cachedActiveMode === "contributor" ? "student" : "contributor";
    persistActiveMode(next);
    const path = next === "contributor" ? CONTRIBUTOR_HOME : STUDENT_HOME;
    if (navigateImpl) {
      navigateImpl(path);
    } else {
      window.location.assign(path);
    }
  }, []);

  const canAccessStudent =
    Boolean(user) &&
    (activeMode === "student" || userRole === "student" || userRole === "both" || userRole === null);
  const canAccessCreator = isContributor;
  const canSwitchModes = isContributor;

  return {
    user,
    session,
    loading,
    userRole,
    isContributor,
    activeMode,
    setActiveMode,
    toggleMode,
    canAccessStudent,
    canAccessCreator,
    canSwitchModes,
    signOut,
  };
};