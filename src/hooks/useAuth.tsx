import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail, isContributorOnboardingComplete } from "@/lib/gamification";
import { ContributorOnboardingModal } from "@/components/ContributorOnboardingModal";

export type UserRole = "student" | "contributor" | "both" | null;
export type ActiveMode = "student" | "contributor";

const ACTIVE_MODE_KEY = "eduminity-active-mode";
const LEGACY_MODE_KEY = "eduminity-mode";

const STUDENT_HOME = "/app/student-dashboard";
const CONTRIBUTOR_HOME = "/app/creator-studio";
const FIRST_STEP_AFTER_INITIATION = "/app/creator-studio";

let cachedSession: Session | null = null;
let cachedUser: User | null = null;
let cachedRole: UserRole = null;
let cachedIsContributor = false;
let hasInitialized = false;
let onboardingModalOpen = false;

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

export const openContributorOnboarding = () => {
  onboardingModalOpen = true;
  emitAuthCache();
};

export const registerAuthNavigator = (fn: NavigateFn | null) => {
  navigateImpl = fn;
};

/** Mount inside the router so toggleMode and ContributorOnboardingModal work globally. */
export const AuthNavigatorBridge = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(onboardingModalOpen);
  const [currentUser, setCurrentUser] = useState<User | null>(cachedUser);

  useEffect(() => {
    registerAuthNavigator(navigate);
    const listener = () => {
      setModalOpen(onboardingModalOpen);
      setCurrentUser(cachedUser);
    };
    modeListeners.add(listener);
    return () => {
      registerAuthNavigator(null);
      modeListeners.delete(listener);
    };
  }, [navigate]);

  const handleOnboardingCompleted = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      cachedUser = data.user;
    }
    cachedIsContributor = true;
    cachedRole = "both";
    onboardingModalOpen = false;
    persistActiveMode("contributor");

    // Move directly to what needs to be done next: uploading their first note
    if (navigateImpl) {
      navigateImpl(FIRST_STEP_AFTER_INITIATION);
    } else {
      window.location.assign(FIRST_STEP_AFTER_INITIATION);
    }
  };

  return (
    <ContributorOnboardingModal
      open={modalOpen}
      onClose={() => {
        onboardingModalOpen = false;
        emitAuthCache();
      }}
      user={currentUser}
      onCompleted={handleOnboardingCompleted}
    />
  );
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [session, setSession] = useState<Session | null>(cachedSession);
  const [userRole, setUserRole] = useState<UserRole>(cachedRole);
  const [isContributor, setIsContributor] = useState(cachedIsContributor);
  const [activeMode, setActiveModeState] = useState<ActiveMode>(cachedActiveMode);
  const [loading, setLoading] = useState(!hasInitialized);

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
      if (isAdminEmail(currentUser.email)) {
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
    if (isAdminEmail(currentUser.email)) return true;
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

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      cachedUser = data.user;
      const role = await fetchUserRole(data.user);
      const contributor = await fetchIsContributor(data.user, role);
      cachedRole = role;
      cachedIsContributor = contributor;
      emitAuthCache();
    }
  }, []);

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
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Ignore missing session errors
    } finally {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") || key === ACTIVE_MODE_KEY || key === LEGACY_MODE_KEY) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("sb-")) {
          sessionStorage.removeItem(key);
        }
      });

      cachedSession = null;
      cachedUser = null;
      cachedRole = null;
      cachedIsContributor = false;
      cachedActiveMode = "student";
      setSession(null);
      setUser(null);
      setUserRole(null);
      setIsContributor(false);
      setActiveModeState("student");
      emitAuthCache();

      window.location.replace("/");
    }
  };

  const setActiveMode = useCallback((mode: ActiveMode) => {
    if (mode === "contributor") {
      if (
        !cachedIsContributor ||
        !isContributorOnboardingComplete(cachedUser?.user_metadata, cachedUser?.email)
      ) {
        openContributorOnboarding();
        return;
      }
    }
    if (cachedActiveMode === mode) return;
    persistActiveMode(mode);
  }, []);

  const toggleMode = useCallback(() => {
    const next: ActiveMode = cachedActiveMode === "contributor" ? "student" : "contributor";
    if (next === "contributor") {
      if (
        !cachedIsContributor ||
        !isContributorOnboardingComplete(cachedUser?.user_metadata, cachedUser?.email)
      ) {
        openContributorOnboarding();
        return;
      }
    }
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
  const hasCompletedCreatorProfile = isContributorOnboardingComplete(
    user?.user_metadata,
    user?.email
  );

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
    hasCompletedCreatorProfile,
    refreshUser,
    signOut,
  };
};