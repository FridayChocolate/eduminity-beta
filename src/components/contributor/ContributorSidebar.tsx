import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutDashboard,
  Upload,
  FolderOpen,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Wallet,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ModeSwitcher } from "@/components/ModeSwitcher";

const navItems = [
  {
    to: "/",
    icon: Home,
    label: "Home",
    exact: true,
  },
  {
    to: "/app/creator-studio",
    icon: LayoutDashboard,
    label: "Creator Studio",
    exact: true,
  },
  {
    to: "/app/upload-notes",
    icon: Upload,
    label: "Upload Notes",
  },
  {
    to: "/app/my-uploads",
    icon: FolderOpen,
    label: "My Uploads",
  },
  {
    to: "/app/creator-earnings",
    icon: Wallet,
    label: "Earnings",
  },
  {
    to: "/app/profile",
    icon: User,
    label: "My Profile",
  },
];

const secondaryNavItems = [
  {
    to: "/app/theme-settings",
    icon: Settings,
    label: "Settings",
  },
];

interface ContributorSidebarProps {
  onNavigate?: () => void;
}

export const ContributorSidebar = ({ onNavigate }: ContributorSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col creator-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-creator-border/50">
        <button
          onClick={() => {
            navigate("/");
            onNavigate?.();
          }}
          aria-label="Eduminity Home"
          className="flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <img
            src="/eduminity-logo.png"
            alt="Eduminity"
            className="h-8 w-8 object-contain flex-shrink-0"
            draggable={false}
          />
          {!collapsed && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-foreground leading-none">
                  Eduminity
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-creator-primary/20 text-creator-primary border border-creator-primary/30 leading-none">
                  Beta
                </span>
              </div>
              <span className="text-[10px] text-creator-primary font-medium mt-0.5">
                Creator Studio
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Mode Switcher - always available in Creator Studio to switch back to Student */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-creator-border/50">
          <ModeSwitcher />
        </div>
      )}

      {/* Collapse Button */}
      <div className="px-2 py-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-muted-foreground hover:text-foreground hover:bg-creator-hover",
            collapsed ? "justify-center" : "justify-end"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                "hover:bg-creator-hover group",
                isActive
                  ? "bg-gradient-to-r from-creator-primary/15 to-creator-cyan/10 text-creator-primary border-l-2 border-creator-primary ml-0.5"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-all duration-200",
                  isActive
                    ? "text-creator-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && <span className="truncate flex-1">{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Secondary Navigation */}
        <div className="pt-4 mt-4 border-t border-creator-border/50 space-y-1">
          {secondaryNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  "hover:bg-creator-hover group",
                  isActive
                    ? "bg-gradient-to-r from-creator-primary/15 to-creator-cyan/10 text-creator-primary border-l-2 border-creator-primary ml-0.5"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-all duration-200",
                    isActive
                      ? "text-creator-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && <span className="truncate flex-1">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Pro Tip Section */}
      {!collapsed && (
        <div className="mx-2 mb-2 p-3 rounded-xl bg-gradient-to-r from-creator-primary/10 to-creator-cyan/10 border border-creator-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="h-4 w-4 text-creator-cyan" />
            <span className="text-xs font-semibold text-creator-primary">Pro Tip</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Notes with previews get 3x more views!
          </p>
        </div>
      )}

      {/* Sign Out */}
      <div className="p-2 border-t border-creator-border/50">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
            collapsed && "justify-center px-0"
          )}
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
};