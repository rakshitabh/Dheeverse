import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  BarChart3,
  Heart,
  Settings,
  Volume2,
  Gamepad2,
  Archive,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJournal } from "@/lib/journal-context";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard", exact: true },
  { href: "/journal", icon: BookOpen, label: "Journal", exact: false },
  { href: "/archive", icon: Archive, label: "Archive", exact: true },
  { href: "/insights", icon: BarChart3, label: "Insights", exact: true },
  { href: "/wellness", icon: Heart, label: "Wellness", exact: false },
  { href: "/sounds", icon: Volume2, label: "Nature Sounds", exact: true },
  { href: "/games", icon: Gamepad2, label: "Games", exact: true },
  { href: "/settings", icon: Settings, label: "Settings", exact: true },
];

export function AppSidebar({ isOpen = true, onClose, collapsed = false }) {
  const location = useLocation();
  const { streakData } = useJournal();

  // Check if a route is active
  const isRouteActive = (href, exact) => {
    if (exact) {
      return location.pathname === href;
    }
    return (
      location.pathname === href || location.pathname.startsWith(`${href}/`)
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] border-r border-border bg-sidebar transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = isRouteActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => {
                    // Close mobile sidebar on navigation
                    if (onClose) onClose();
                  }}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    collapsed ? "justify-center" : "gap-3",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Streak Card */}
          {!collapsed && (
            <div className="p-4 border-t border-sidebar-border">
              <div className="rounded-xl bg-primary/10 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">Current Streak</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">
                    {streakData.currentStreak}
                  </span>
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Keep it up! You're building a great habit.
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
