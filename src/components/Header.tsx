import {
  User,
  Wallet,
  Menu,
  Settings2,
  LayoutDashboard,
  Sparkles,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ModeToggle } from "@/components/ModeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMode } from "@/contexts/ModeContext";
import { cn } from "@/lib/utils";
import { SearchDialog } from "@/components/SearchDialog";

const ADMIN_EMAIL = "business.neurovane@gmail.com";

export const Header = () => {
  const { user, canAccessCreator, canSwitchModes } = useAuth();
  const { mode, setMode } = useMode();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isCreatorMode = mode === "contributor" && canAccessCreator;
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Could not log out",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const navigateTo = (path: string, targetMode?: "student" | "contributor") => {
    if (targetMode && mode !== targetMode) {
      setMode(targetMode);
    }
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border backdrop-blur transition-mode",
        "bg-background/95 supports-[backdrop-filter]:bg-background/60",
        isCreatorMode && "border-creator-border/50"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Link
            to="/"
            aria-label="Eduminity home"
            className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-90"
          >
            <img
              src="/eduminity-logo.png"
              alt="Eduminity"
              className="h-8 w-8 object-contain select-none"
              draggable={false}
            />
            <span className="font-bold text-lg tracking-tight text-foreground">
              Eduminity
            </span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 leading-none">
              Beta
            </span>
          </Link>

          {/* Portal-Aware Desktop Navigation */}
          <nav className="hidden lg:flex gap-6">
            {isCreatorMode ? (
              <>
                <button
                  onClick={() => navigateTo("/app/creator-studio")}
                  className="text-sm font-medium text-foreground hover:text-creator-primary transition-colors"
                >
                  Creator Home
                </button>
                <button
                  onClick={() => navigateTo("/app/my-uploads")}
                  className="text-sm font-medium text-foreground hover:text-creator-primary transition-colors"
                >
                  My Uploads
                </button>
                <button
                  onClick={() => navigateTo("/app/upload-notes")}
                  className="text-sm font-medium text-foreground hover:text-creator-primary transition-colors"
                >
                  Upload Notes
                </button>
                <button
                  onClick={() => navigateTo("/app/creator-earnings")}
                  className="text-sm font-medium text-foreground hover:text-creator-primary transition-colors"
                >
                  Earnings
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigateTo("/")}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Home
                </button>
                {user && (
                  <button
                    onClick={() => navigateTo("/app/student-dashboard", "student")}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Dashboard
                  </button>
                )}
                <button
                  onClick={() => navigateTo("/app/materials")}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Study Hub
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Search Button */}
          <SearchDialog />

          {/* Mode Toggle for dual-role users */}
          {canSwitchModes && (
            <div className="hidden md:block">
              <ModeToggle />
            </div>
          )}

          {/* Theme Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateTo("/app/theme-settings")}
                className="hover:bg-muted dark:hover:shadow-glow-teal transition-all"
              >
                <Settings2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Theme Settings</p>
            </TooltipContent>
          </Tooltip>

          {/* Theme Toggle */}
          <ThemeToggle />

          {user ? (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* Creator Earnings shortcut */}
              {canAccessCreator && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateTo("/app/creator-earnings", "contributor")}
                      className="hover:bg-muted dark:hover:shadow-glow-teal transition-all"
                    >
                      <Wallet className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Creator Earnings</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Account Dropdown Menu */}
              <div ref={profileMenuRef} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-label="Account menu"
                  className="hover:bg-muted dark:hover:shadow-glow-teal transition-all"
                >
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                </Button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#1A1A1F] border border-white/10 shadow-2xl z-50 overflow-hidden text-white p-1.5">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {user.email}
                      </p>
                      <p className="text-[11px] text-teal-400">
                        {isCreatorMode ? "Creator Mode" : "Learning Mode"}
                      </p>
                    </div>

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

                    {canAccessCreator && (
                      <>
                        <button
                          onClick={() => navigateTo("/app/creator-studio", "contributor")}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-left transition-colors"
                        >
                          <Sparkles className="h-4 w-4 text-purple-400" />
                          Creator Studio
                        </button>

                        <button
                          onClick={() => navigateTo("/app/creator-earnings", "contributor")}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-left transition-colors"
                        >
                          <Wallet className="h-4 w-4 text-emerald-400" />
                          Earnings & Payouts
                        </button>
                      </>
                    )}

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
            </>
          ) : (
            <Button onClick={() => navigate("/auth")} size="sm" className="text-xs md:text-sm">
              Get Started
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="flex flex-col gap-3 mt-8">
                {canSwitchModes && (
                  <div className="pb-4 border-b border-border">
                    <ModeToggle />
                  </div>
                )}

                {isCreatorMode ? (
                  <>
                    <button
                      onClick={() => navigateTo("/app/creator-studio")}
                      className="text-left text-base font-medium p-2 rounded-md hover:bg-muted"
                    >
                      Creator Home
                    </button>
                    <button
                      onClick={() => navigateTo("/app/my-uploads")}
                      className="text-left text-base font-medium p-2 rounded-md hover:bg-muted"
                    >
                      My Uploads
                    </button>
                    <button
                      onClick={() => navigateTo("/app/upload-notes")}
                      className="text-left text-base font-medium p-2 rounded-md hover:bg-muted"
                    >
                      Upload Notes
                    </button>
                    <button
                      onClick={() => navigateTo("/app/creator-earnings")}
                      className="text-left text-base font-medium p-2 rounded-md hover:bg-muted"
                    >
                      Earnings & Payouts
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigateTo("/")}
                      className="text-left text-base font-medium p-2 rounded-md hover:bg-muted"
                    >
                      Home
                    </button>
                    {user && (
                      <button
                        onClick={() => navigateTo("/app/student-dashboard", "student")}
                        className="text-left text-base font-medium p-2 rounded-md hover:bg-muted"
                      >
                        Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => navigateTo("/app/materials")}
                      className="text-left text-base font-medium p-2 rounded-md hover:bg-muted"
                    >
                      Study Hub
                    </button>
                  </>
                )}

                {user && (
                  <>
                    <div className="border-t border-border my-2" />
                    <button
                      onClick={() => navigateTo("/app/profile")}
                      className="text-left text-base font-medium p-2 rounded-md hover:bg-muted"
                    >
                      My Profile
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => navigateTo("/admin")}
                        className="text-left text-base font-medium text-rose-400 p-2 rounded-md hover:bg-muted"
                      >
                        Admin Panel
                      </button>
                    )}
                    <Button variant="outline" onClick={handleLogout} className="justify-start mt-2">
                      Logout
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};