import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "student" | "contributor" | "both" | null;

const ADMIN_EMAIL = "business.neurovane@gmail.com";

// Module-level cache so navigating between pages never flashes or loops
let cachedSession: Session | null = null;
let cachedUser: User | null = null;
let cachedRole: UserRole = null;
let hasInitialized = false;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [session, setSession] = useState<Session | null>(cachedSession);
  const [userRole, setUserRole] = useState<UserRole>(cachedRole);
  const [loading, setLoading] = useState(!hasInitialized);
  const { toast } = useToast();

  const fetchUserRole = async (currentUser: User): Promise<UserRole> => {
    try {
      // Admin always has access to both portals
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

      // Fallback to user_metadata.role if user_roles table has no row
      const metaRole = String(currentUser.user_metadata?.role || "").toLowerCase();
      if (metaRole === "both") return "both";
      if (metaRole === "contributor" || metaRole === "creator") return "contributor";
      const canAccessStudent = Boolean(user);
  const canAccessCreator = userRole === "contributor" || userRole === "both";
  const canSwitchModes = canAccessCreator;

      return "student";
    } catch {
      return "student";
    }
  };

  useEffect(() => {
    let mounted = true;

    const syncSession = async (nextSession: Session | null) => {
      cachedSession = nextSession;
      cachedUser = nextSession?.user ?? null;

      if (nextSession?.user) {
        const role = await fetchUserRole(nextSession.user);
        cachedRole = role;
      } else {
        cachedRole = null;
      }

      hasInitialized = true;

      if (mounted) {
        setSession(cachedSession);
        setUser(cachedUser);
        setUserRole(cachedRole);
        setLoading(false);
      }
    };

    // Check existing session immediately
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      syncSession(initialSession);
    });

    // Listen for login / logout changes
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      cachedSession = null;
      cachedUser = null;
      cachedRole = null;
      setSession(null);
      setUser(null);
      setUserRole(null);
    }
  };

  const canAccessStudent = userRole === "student" || userRole === "both";
  const canAccessCreator = userRole === "contributor" || userRole === "both";
  const canSwitchModes = userRole === "both";

  return {
    user,
    session,
    loading,
    userRole,
    canAccessStudent,
    canAccessCreator,
    canSwitchModes,
    signOut,
  };
};