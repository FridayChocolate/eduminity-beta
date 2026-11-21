import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

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
  const { user, loading, userRole, activeMode, canAccessCreator } = useAuth();

  if (loading || (user && userRole === null)) {
    return <ProtectedRouteLoader />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedPortal === "contributor" && !canAccessCreator) {
    return <Navigate to="/app/student-dashboard" replace />;
  }

  // Contributors keep full student access whenever they are in student mode.
  const canUseStudentPortal =
    activeMode === "student" || userRole === "student" || userRole === "both";

  if (allowedPortal === "student" && !canUseStudentPortal) {
    return <Navigate to="/app/creator-studio" replace />;
  }

  return <>{children}</>;
};