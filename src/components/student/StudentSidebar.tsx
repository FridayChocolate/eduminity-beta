import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutDashboard,
  Search,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ModeToggle } from "@/components/ModeToggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  {
    to: "/",
    icon: Home,
    label: "Home",
    exact: true,
  },
  {
    to: "/app/student-dashboard",
    icon: LayoutDashboard,
    label: "Dashboard & Library",
    exact: true,
  },
  {
    to: "/app/materials",
    icon: Search,
    label: "Browse Study Hub",
  },
  {
    to: "/app/notifications",
    icon: Bell,
    label: "Notifications",
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

export const StudentSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, canSwitchModes } = useAuth();

  const NavItem = ({ item, isActive }: { item: (typeof navItems)[0]; isActive: boolean }) => {
    const content = (
      <NavLink
        to={item.to}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
          "hover:bg-muted/50 group",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        <item.icon
          className={cn(
            "h-5 w-5 flex-shrink-0 transition-colors",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
        />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-border bg-card/50 transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "h-14 flex items-center border-b border-border",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {!collapsed && (
          <button
            onClick={() => navigate("/")}
            aria-label="Eduminity home"
            className="flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <img
              src="/eduminity-logo.png"
              alt="Eduminity"
              className="h-7 w-7 object-contain"
              draggable={false}
            />
            <span className="font-bold text-base tracking-tight text-foreground">
              Eduminity
            </span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 leading-none">
              Beta
            </span>
          </button>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Mode Toggle - shown for accounts with Creator access */}
      {!collapsed && canSwitchModes && (
        <div className="px-3 py-3 border-b border-border">
          <ModeToggle />
        </div>
      )}

      {/* Primary Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Student Portal
            </p>
          )}
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return <NavItem key={item.to} item={item} isActive={isActive} />;
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="pt-4 mt-4 border-t border-border space-y-1">
          {secondaryNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return <NavItem key={item.to} item={item} isActive={isActive} />;
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                collapsed ? "justify-center px-0" : "justify-start"
              )}
              onClick={signOut}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Sign Out</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">Sign Out</TooltipContent>}
        </Tooltip>
      </div>
    </aside>
  );
};