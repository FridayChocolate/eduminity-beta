import { ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ContributorSidebar } from "@/components/contributor/ContributorSidebar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useMode } from "@/contexts/ModeContext";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/PageTransition";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Sparkles,
  Menu,
  User,
  LayoutDashboard,
  Wallet,
  ShieldCheck,
  LogOut,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface ContributorLayoutProps {
  children: ReactNode;
}

const ADMIN_EMAIL = "business.neurovane@gmail.com";

export const ContributorLayout = ({ children }: ContributorLayoutProps) => {
  const { user, loading, isContributor, activeMode, toggleMode } = useAuth();
  const navigate = useNavigate();
  const { mode, setMode } = useMode();
  const [showModeToast, setShowModeToast] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  // Set contributor mode when this layout mounts
  useEffect(() => {
    if (mode !== "contributor") {
      setMode("contributor");
      setShowModeToast(true);
      const timer = setTimeout(() => setShowModeToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateTo = (path: string, targetMode?: "student" | "contributor") => {
    if (targetMode && mode !== targetMode) {
      setMode(targetMode);
    }
    setProfileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfileMenuOpen(false);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-creator-primary to-creator-cyan flex items-center justify-center animate-pulse">
            <Sparkles className="h-6 w-6 text-background" />
          </div>
          <p className="text-sm text-muted-foreground">Loading Creator Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-background contributor-mode">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full animate-pulse-soft opacity-40"
          style={{
            background: "radial-gradient(circle at center, hsl(var(--creator-primary) / 0.15), transparent 50%)",
          }}
        />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full animate-pulse-soft opacity-40"
          style={{
            background: "radial-gradient(circle at center, hsl(var(--creator-cyan) / 0.1), transparent 50%)",
            animationDelay: "1s",
          }}
        />
      </div>

      {/* Mode Toast */}
      {showModeToast && (
        <div className="creator-mode-toast text-background font-semibold flex items-center gap-2 shadow-xl">
          <Sparkles className="h-4 w-4" />
          You are now in Creator Mode
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <ContributorSidebar />
      </div>

      <main className="flex-1 min-w-0 w-full overflow-x-hidden">
        {/* Top Bar with Notifications */}
        <div className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-creator-border/30">
          <div className="flex items-center justify-between gap-2 px-2 sm:px-6 md:px-8 py-2.5 sm:py-3">
            {/* Left side: Mobile Menu + Logo */}
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="md:hidden shrink-0">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-72 bg-card border-creator-border/50">
                    <ContributorSidebar onNavigate={() => setMobileMenuOpen(false)} />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Clickable Logo for mobile */}
              <button
                onClick={() => navigateTo("/app/creator-studio")}
                className="md:hidden flex items-center gap-2 hover:opacity-85 transition-opacity min-w-0"
              >
                <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-creator-primary to-creator-violet flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-background" />
                </div>
                <span className="hidden sm:inline font-bold text-sm truncate">Creator Studio</span>
              </button>

              {/* Desktop Quick Home Anchor */}
              <button
                onClick={() => navigateTo("/app/creator-studio")}
                className="hidden md:flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-creator-primary transition-colors"
              >
                <Sparkles className="h-4 w-4 text-creator-primary" />
                <span>Creator Dashboard</span>
              </button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Mode Switcher */}
              <ModeSwitcher />

              {/* Account Dropdown */}
              <div ref={profileMenuRef} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-label="Account menu"
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-creator-primary/10 hover:text-creator-primary transition-all"
                >
                  <User className="h-5 w-5" />
                </Button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-1rem)] rounded-2xl bg-[#1A1A1F] border border-white/10 shadow-2xl z-50 overflow-hidden text-white p-1.5">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {user?.email}
                      </p>
                      <p className="text-[11px] text-purple-400">Creator Studio</p>
                    </div>

                    {isContributor && (
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          toggleMode();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-left transition-colors text-teal-300"
                      >
                        <ArrowLeftRight className="h-4 w-4 text-teal-400" />
                        {activeMode === "contributor"
                          ? "Switch to Student View"
                          : "Switch to Contributor Studio"}
                      </button>
                    )}

                    <button
                      onClick={() => navigateTo("/app/creator-studio", "contributor")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-left transition-colors"
                    >
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      Creator Dashboard
                    </button>

                    <button
                      onClick={() => navigateTo("/app/creator-earnings", "contributor")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-left transition-colors"
                    >
                      <Wallet className="h-4 w-4 text-emerald-400" />
                      Earnings & Payouts
                    </button>

                    <button
                      onClick={() => navigateTo("/app/profile")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-left transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-400" />
                      My Profile
                    </button>

                    <button
                      onClick={() => navigateTo("/app/student-dashboard", "student")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-left transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-teal-400" />
                      Student Dashboard
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => navigateTo("/admin")}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-rose-500/15 text-rose-300 text-left transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4 text-rose-400" />
                        Admin Panel
                      </button>
                    )}

                    <div className="my-1 border-t border-white/10" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-red-500/15 text-red-400 text-left transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <NotificationBell />
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full min-w-0">
          <Breadcrumbs />
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
};