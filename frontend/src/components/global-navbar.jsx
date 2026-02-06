import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Moon,
  Sun,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/lib/theme-context";
import { useUser } from "@/lib/user-context";
import { useJournal } from "@/lib/journal-context";
import { userAPI } from "@/lib/api";
import { toast } from "sonner";
import { format, isToday, startOfWeek, endOfWeek } from "date-fns";

export function GlobalNavbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, logout } = useUser();
  const { entries } = useJournal();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSettings, setUserSettings] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Exact-time scheduled reminder popup (client-side)
  useEffect(() => {
    if (
      !userSettings?.notifications?.enabled ||
      !userSettings.notifications.scheduledReminders
    ) {
      return;
    }

    const reminderTimeStr = userSettings.notifications.reminderTime || "21:30";
    const [hhStr, mmStr] = reminderTimeStr.split(":");
    const targetHour = parseInt(hhStr, 10);
    const targetMinute = parseInt(mmStr, 10);

    const storageKey = `dv_lastReminderShown_${user?.id || "anon"}`;

    const tick = () => {
      // Avoid if user already journaled today
      const todayHasEntry = entries.some((e) => isToday(new Date(e.createdAt)));
      if (todayHasEntry) return;

      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      const lastShownISO = localStorage.getItem(storageKey);
      const lastShownDate = lastShownISO ? new Date(lastShownISO) : null;
      const shownToday = lastShownDate ? isToday(lastShownDate) : false;

      // Show toast exactly at the specified time, once per day
      if (!shownToday && hour === targetHour && minute === targetMinute) {
        toast.info("Scheduled Reminder", {
          description: `It\'s ${reminderTimeStr}. Take a moment to journal.`,
          action: {
            label: "Start Journaling",
            onClick: () => navigate("/journal/new"),
          },
        });

        // Reflect in notifications dropdown immediately
        setNotifications((prev) => [
          {
            id: `scheduled-reminder-${now.toISOString()}`,
            title: "Scheduled Reminder",
            message: `Remember to journal at ${reminderTimeStr} today!`,
            icon: Clock,
            time: now,
          },
          ...prev,
        ]);

        localStorage.setItem(storageKey, now.toISOString());
      }
    };

    // First tick quickly, then every 30 seconds to be resilient
    tick();
    const intervalId = setInterval(tick, 30 * 1000);
    return () => clearInterval(intervalId);
  }, [userSettings, entries, user?.id, navigate]);

  // Load user settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await userAPI.getSettings();
        setUserSettings(data.settings);
      } catch (error) {
        console.error("Failed to load user settings", error);
      }
    };
    loadSettings();
  }, []);

  // Generate notifications based on user settings and entries
  useEffect(() => {
    if (!userSettings?.notifications?.enabled) {
      setNotifications([]);
      return;
    }

    const newNotifications = [];
    const todayEntries = entries.filter((entry) =>
      isToday(new Date(entry.createdAt))
    );
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const weekEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

    // Daily reminder notification - always show if enabled and no entry today
    if (userSettings.notifications.reminders) {
      if (todayEntries.length === 0) {
        newNotifications.push({
          id: "daily-reminder",
          title: "Daily Journal Reminder",
          message: "You haven't journaled today. Take a moment to reflect.",
          icon: Clock,
          time: new Date(),
        });
      }
    }

    // Scheduled reminder notification - show always if enabled and no entry today
    if (
      userSettings.notifications.scheduledReminders &&
      todayEntries.length === 0
    ) {
      newNotifications.push({
        id: "scheduled-reminder",
        title: "Scheduled Reminder",
        message: `Remember to journal at ${userSettings.notifications.reminderTime} today!`,
        icon: Clock,
        time: new Date(),
      });
    }

    // Weekly summary notification (if enabled and it's the end of week)
    if (userSettings.notifications.weeklySummary && weekEntries.length > 0) {
      const today = new Date().getDay();
      if (today === 0) {
        // Sunday
        newNotifications.push({
          id: "weekly-summary",
          title: "Weekly Summary",
          message: `You journaled ${weekEntries.length} times this week. Great job!`,
          icon: TrendingUp,
          time: new Date(),
        });
      }
    }

    setNotifications(newNotifications);
  }, [userSettings, entries]);

  const searchResults = searchQuery.trim()
    ? entries
        .filter(
          (entry) =>
            entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            ) ||
            entry.emotions.some((e) =>
              e.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
        .slice(0, 5)
    : [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/journal?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleThemeToggle = async () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    toast.success(`Switched to ${nextTheme} theme`, {
      description: "Theme preference saved.",
    });
    try {
      await userAPI.updateSettings({ theme: nextTheme });
    } catch (err) {
      // Non-blocking: keep local theme even if network fails
      console.error("Failed to persist theme", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          {/* Left: Menu toggle + Logo */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
            <button
              onClick={() => navigate("/dashboard", { replace: true })}
              className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
                <img
                  src="/dheverse-logo.jpg"
                  alt="DheeVerse"
                  className="h-8 w-8 object-cover"
                />
              </div>
              <span className="font-semibold hidden sm:inline">DheeVerse</span>
            </button>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search entries, tags, emotions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50"
              />
              {searchResults.length > 0 && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden">
                  {searchResults.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-muted text-sm"
                      onClick={() => {
                        navigate(
                          `/journal?search=${encodeURIComponent(searchQuery)}`
                        );
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <p className="line-clamp-1">{entry.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.emotions.join(", ")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3 border-b">
                  <h4 className="font-medium">Notifications</h4>
                  {!userSettings?.notifications?.enabled && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Notifications are disabled. Enable them in{" "}
                      <button
                        onClick={() => navigate("/settings")}
                        className="text-primary hover:underline"
                      >
                        Settings
                      </button>
                    </p>
                  )}
                </div>
                {notifications.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => {
                      const IconComponent = notification.icon;
                      return (
                        <div
                          key={notification.id}
                          className="p-3 hover:bg-muted/50 cursor-pointer transition border-b last:border-b-0"
                          onClick={() => {
                            if (
                              notification.id === "daily-reminder" ||
                              notification.id === "scheduled-reminder"
                            ) {
                              navigate("/journal/new");
                            } else if (notification.id === "weekly-summary") {
                              navigate("/insights");
                            }
                          }}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <IconComponent className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(notification.time, "h:mm a")}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {userSettings?.notifications?.enabled
                        ? "You have no new notifications."
                        : "Enable notifications to stay updated."}
                    </p>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.avatar || "/placeholder.svg"}
                      alt={user?.name}
                    />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="absolute top-14 left-0 right-0 p-4 bg-background border-b md:hidden">
            <form onSubmit={handleSearch}>
              <Input
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </form>
          </div>
        )}
      </header>
    </>
  );
}
