"use client";

import { useState } from "react";
import { updateNotificationPreferences } from "@/lib/notification-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NotificationPrefs {
  daily_reminder_enabled: boolean;
  friend_checkin_enabled: boolean;
  battle_invite_enabled: boolean;
  boss_battle_enabled: boolean;
  weekly_summary_enabled: boolean;
}

const SETTINGS = [
  { key: "daily_reminder_enabled", label: "每日打卡提醒", description: "每天提醒你完成打卡", emoji: "⏰" },
  { key: "friend_checkin_enabled", label: "朋友打卡通知", description: "朋友完成打卡時通知你", emoji: "🔥" },
  { key: "battle_invite_enabled", label: "PK 邀請通知", description: "收到對戰邀請時通知", emoji: "⚔️" },
  { key: "boss_battle_enabled", label: "Boss 戰通知", description: "每週 Boss 戰開始時通知", emoji: "👹" },
  { key: "weekly_summary_enabled", label: "每週摘要", description: "每週日發送運動摘要", emoji: "📊" },
] as const;

export function NotificationSettingsClient({ prefs }: { prefs: NotificationPrefs | null }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, boolean>>(() => {
    if (!prefs) return Object.fromEntries(SETTINGS.map((s) => [s.key, true]));
    return Object.fromEntries(SETTINGS.map((s) => [s.key, prefs[s.key as keyof NotificationPrefs]]));
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const formData = new FormData();
    for (const [key, val] of Object.entries(values)) {
      formData.set(key, String(val));
    }
    await updateNotificationPreferences(formData);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-3">
      {SETTINGS.map((setting) => (
        <div
          key={setting.key}
          className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{setting.emoji}</span>
            <div>
              <p className="text-sm font-medium">{setting.label}</p>
              <p className="text-xs text-muted">{setting.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setValues((v) => ({ ...v, [setting.key]: !v[setting.key] }))}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              values[setting.key] ? "bg-accent" : "bg-muted/30"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                values[setting.key] ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        {saving ? "儲存中..." : saved ? "已儲存 ✓" : "儲存設定"}
      </button>

      <Link
        href="/profile"
        className="block text-center text-sm text-muted hover:text-foreground"
      >
        ← 返回個人設定
      </Link>
    </div>
  );
}
