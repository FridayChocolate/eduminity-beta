import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  portal?: string | null;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

const PORTAL_TAGS: Record<string, { label: string; classes: string }> = {
  learning: {
    label: "Learning",
    classes: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  },
  contributor: {
    label: "Creator",
    classes: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  },
  admin: {
    label: "Admin",
    classes: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
};

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(25);

      if (!error && data) {
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load + Realtime live popups + 30s fallback refresh
  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const incoming = payload.new as NotificationItem;

          setNotifications((prev) => {
            if (prev.some((item) => item.id === incoming.id)) return prev;
            return [incoming, ...prev];
          });

          const portalKey = (incoming.portal || "learning").toLowerCase();
          const portalLabel = PORTAL_TAGS[portalKey]?.label || "Learning";

          toast({
            title: `[${portalLabel}] ${incoming.title}`,
            description: incoming.message,
          });
        }
      )
      .subscribe();

    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifications();
  };

  const handleClickNotification = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === notif.id ? { ...item, is_read: true } : item))
      );
      await (supabase as any)
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notif.id);
    }

    setOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id || unreadCount === 0) return;

    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    await (supabase as any)
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  };

  const formatTime = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative hover:bg-muted dark:hover:shadow-glow-teal transition-all"
      >
        <Bell className={`h-4 w-4 md:h-5 md:w-5 ${unreadCount > 0 ? "text-teal-400" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#1A1A1F] border border-white/10 shadow-2xl z-50 overflow-hidden text-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#2A2A32]/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                You&apos;re all caught up! No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => {
                const portalKey = (notif.portal || "learning").toLowerCase();
                const tag = PORTAL_TAGS[portalKey] || PORTAL_TAGS.learning;

                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClickNotification(notif)}
                    className={`w-full text-left px-4 py-3.5 hover:bg-white/5 transition-colors flex flex-col gap-1.5 ${
                      !notif.is_read ? "bg-indigo-500/10" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${tag.classes}`}
                      >
                        {tag.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-gray-400">
                          {formatTime(notif.created_at)}
                        </span>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-white leading-snug">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {notif.message}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}