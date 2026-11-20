import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface StudentLayoutProps {
  children: ReactNode;
}

export const StudentLayout = ({ children }: StudentLayoutProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background flex w-full" 
      data-mode="student"
    >
      <StudentSidebar />
      <main className={cn(
        "flex-1 overflow-auto",
        "bg-background"
      )}>
        {children}
      </main>
    </div>
  );
};
