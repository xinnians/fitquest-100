"use client";

import { useState, useEffect, useCallback } from "react";
import { getUnreadNotifications, markNotificationsRead, getRecentNotifications } from "@/lib/notification-actions";
import { useRouter, usePathname } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string | null;
  body: string | null;
  payload: Record<string, unknown>;
  sent_at: string;
  read_at: string | null;
}

const TYPE_EMOJI: Record<string, string> = {
  friend_checked_in: "🔥",
  pk_invite: "⚔️",
  boss_battle_start: "👹",
  achievement_unlocked: "🏆",
  level_up: "⬆️",
};

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const fetchUnreadCount = useCallback(async () => {
    const { unreadCount: count } = await getUnreadNotifications();
    setUnreadCount(count);
  }, []);

  // Refetch on route change
  useEffect(() => {
    fetchUnreadCount();
  }, [pathname, fetchUnreadCount]);

  async function handleOpen() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
    setLoading(true);
    const data = await getRecentNotifications();
    setNotifications(data);
    setLoading(false);

    // Mark all as read
    if (unreadCount > 0) {
      await markNotificationsRead();
      setUnreadCount(0);
    }
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "剛剛";
    if (minutes < 60) return `${minutes} 分鐘前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小時前`;
    const days = Math.floor(hours / 24);
    return `${days} 天前`;
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative rounded-lg p-1.5 text-muted transition-colors hover:text-foreground"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-heading text-sm font-bold">通知</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted">載入中...</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-2xl">🔔</p>
                  <p className="mt-1 text-sm text-muted">還沒有通知</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`border-b border-border px-4 py-3 last:border-0 ${
                      !n.read_at ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-base">{TYPE_EMOJI[n.type] ?? "📌"}</span>
                      <div className="flex-1 min-w-0">
                        {n.title && (
                          <p className="text-sm font-medium">{n.title}</p>
                        )}
                        {n.body && (
                          <p className="text-xs text-muted">{n.body}</p>
                        )}
                        <p className="mt-0.5 text-[10px] text-muted/60">{formatTime(n.sent_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
