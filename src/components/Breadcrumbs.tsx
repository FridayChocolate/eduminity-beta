import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "student-dashboard": "Student Dashboard",
  materials: "Study Hub",
  "creator-studio": "Creator Studio",
  "my-uploads": "My Uploads",
  "upload-notes": "Upload Notes",
  "creator-earnings": "Earnings & Payouts",
  profile: "My Profile",
  "theme-settings": "Theme Settings",
  admin: "Admin Panel",
  creator: "Creator Profile",
};

const isUuid = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const formatSegment = (segment: string, prevSegment?: string) => {
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment];
  if (isUuid(segment)) {
    return prevSegment === "materials" ? "Material Details" : "Details";
  }
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const Breadcrumbs = () => {
  const { pathname } = useLocation();

  // Keep the Home page clean without breadcrumbs
  if (pathname === "/") return null;

  const rawSegments = pathname.split("/").filter(Boolean);

  // Build clickable trail while skipping the invisible "/app" prefix
  const crumbs: { label: string; path: string }[] = [];
  let currentPath = "";

  rawSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    if (segment === "app") return;

    crumbs.push({
      label: formatSegment(segment, rawSegments[index - 1]),
      path: currentPath,
    });
  });

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-muted-foreground mb-4"
    >
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>

      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <div key={crumb.path} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight className="h-3.5 w-3.5 opacity-50 shrink-0" />
            {isLast ? (
              <span className="font-medium text-foreground truncate">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="hover:text-foreground transition-colors truncate"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};