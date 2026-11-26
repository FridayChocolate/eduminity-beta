import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedPortal?: "student" | "contributor" | "any";
}

const ProtectedRouteLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export const ProtectedRoute = ({
  children,
  allowedPortal = "any",
}: ProtectedRouteProps) => {
  const { user, loading, canAccessCreator } = useAuth();

  if (loading) {
    return <ProtectedRouteLoader />;
  }

  if (!user) {
    return <Navigate to={ROUTES.AUTH} replace />;
  }

  // Only restrict contributor-only routes if user hasn't unlocked Creator access yet
  if (allowedPortal === "contributor" && !canAccessCreator) {
    return <Navigate to={ROUTES.PROFILE} replace />;
  }

  return <>{children}</>;
};