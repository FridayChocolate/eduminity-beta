import {
  User,
  Menu,
  Sparkles,
  LogOut,
  ShieldCheck,
  ArrowLeftRight,
  ExternalLink,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ModeToggle } from "@/components/ModeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useMode } from "@/contexts/ModeContext";
import { cn } from "@/lib/utils";
import { SearchDialog } from "@/components/SearchDialog";
import { isAdminEmail } from "@/lib/gamification";
import { ROUTES } from "@/lib/routes";

export const Header = () => {
  const {
    user,
    canAccessCreator,
    canSwitchModes,
    isContributor,
    activeMode,
    toggleMode,
    signOut,
  } = useAuth();
  const { mode, setMode } = useMode();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isCreatorMode = mode === "contributor" && canAccessCreator;
  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
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
        "sticky top-0 z-50 w-full max-w-full border-b border-border backdrop-blur transition-mode",
        "bg-background/95 supports-[backdrop-filter]:bg-background/60",
        isCreatorMode && "border-creator-border/50"
      )}
    >
      <div className="container flex h-14 sm:h-16 items-center justify-between gap-2 px-3 sm:px-4 max-w-full">
        <div className="flex items-center gap-3 md:gap-8 min-w-0">
          <Link
            to={user ? ROUTES.APP : ROUTES.LANDING}
            aria-label="Eduminity home"
            className="flex items-center gap-1.5 sm:gap-2 shrink-0 transition-opacity hover:opacity-90"
          >
            <img
              src="/eduminity-logo.png"
              alt="Eduminity"
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain select-none"
              draggable={false}
            />
            <span className="font-bold text-base sm:text-lg tracking-tight text-foreground">
              Eduminity
            </span>
            <span className="hidden sm:inline-block text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 leading-none">
              Beta 2.0
            </span>
          </Link>

          {/* Clean Core Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigateTo(user ? ROUTES.APP : ROUTES.LANDING)}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => navigateTo(ROUTES.MATERIALS)}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Study Hub
            </button>
            {user && (
              <button
                type="button"
                onClick={() => navigateTo(ROUTES.UPDATES)}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Updates
              </button>
            )}
            {canAccessCreator && (
              <button
                type="button"
                onClick={() => navigateTo(ROUTES.UPLOAD_NOTES, "contributor")}
                className="text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
              >
                + Upload Notes
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <SearchDialog />

          {canSwitchModes && (
            <div className="hidden md:block">
              <ModeToggle />
            </div>
          )}

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {user ? (
            <>
              <NotificationBell />

              {/* Streamlined Account Menu */}
              <div ref={profileMenuRef} className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-label="Account menu"
                  className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-muted transition-all"
                >
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                </Button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-1rem)] rounded-2xl bg-[#1A1A1F] border border-white/10 shadow-2xl z-50 overflow-hidden text-white p-1.5">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {user.email}
                      </p>
                      <p className="text-[11px] text-teal-400">
                        {isCreatorMode ? "Creator Mode" : "Learning Mode"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigateTo(ROUTES.PROFILE)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-left transition-colors"
                    >
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      Profile &amp; Creator Studio
                    </button>

                    {canAccessCreator && (
                      <>
                        <button
                          type="button"
                          onClick={() => navigateTo(ROUTES.UPLOAD_NOTES, "contributor")}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-left transition-colors"
                        >
                          <Upload className="h-4 w-4 text-teal-400" />
                          Upload Study Notes
                        </button>

                        <button
                          type="button"
                          onClick={() => navigateTo(ROUTES.creatorShowcase(user.id))}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-left transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                          Public Showcase
                        </button>
                      </>
                    )}

                    {isContributor && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          toggleMode();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-left transition-colors text-teal-300"
                      >
                        <ArrowLeftRight className="h-4 w-4 text-teal-400" />
                        {activeMode === "contributor"
                          ? "Switch to Learning Mode"
                          : "Switch to Creator Mode"}
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => navigateTo(ROUTES.ADMIN)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-rose-500/15 text-rose-300 text-left transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4 text-rose-400" />
                        Admin Command Center
                      </button>
                    )}

                    <div className="my-1 border-t border-white/10" />

                    <button
                      type="button"
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
            <Button
              onClick={() => navigate(ROUTES.AUTH)}
              size="sm"
              className="text-xs px-3 md:text-sm"
            >
              Get Started
            </Button>
          )}

          {/* Mobile Drawer */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] max-w-[85vw] overflow-y-auto">
              <nav className="flex flex-col gap-3 mt-8">
                {canSwitchModes && (
                  <div className="pb-4 border-b border-border">
                    <ModeToggle />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => navigateTo(user ? ROUTES.APP : ROUTES.LANDING)}
                  className="text-left text-base font-medium p-2 rounded-md hover:bg-muted"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo(ROUTES.MATERIALS)}
                  className="text-left text-base font-medium p-2 rounded-md hover:bg-muted"
                >
                  Study Hub
                </button>
                {user && (
                  <button
                    type="button"
                    onClick={() => navigateTo(ROUTES.UPDATES)}
                    className="text-left text-base font-medium p-2 rounded-md hover:bg-muted"
                  >
                    Updates &amp; Changelog
                  </button>
                )}
                {canAccessCreator && (
                  <button
                    type="button"
                    onClick={() => navigateTo(ROUTES.UPLOAD_NOTES, "contributor")}
                    className="text-left text-base font-semibold text-teal-400 p-2 rounded-md hover:bg-muted"
                  >
                    + Upload Notes
                  </button>
                )}

                <div className="border-t border-border my-2 pt-3 flex items-center justify-between px-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Appearance
                  </span>
                  <ThemeToggle />
                </div>

                {user && (
                  <>
                    <div className="border-t border-border my-1" />
                    <button
                      type="button"
                      onClick={() => navigateTo(ROUTES.PROFILE)}
                      className="text-left text-base font-medium p-2 rounded-md hover:bg-muted"
                    >
                      Profile &amp; Creator Studio
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => navigateTo(ROUTES.ADMIN)}
                        className="text-left text-base font-medium text-rose-400 p-2 rounded-md hover:bg-muted"
                      >
                        Admin Command Center
                      </button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="justify-start mt-2"
                    >
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