"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// === Notification Types ===
export type NotificationType =
  | "friend_checked_in"
  | "pk_invite"
  | "boss_battle_start"
  | "achievement_unlocked"
  | "level_up";

interface Notification {
  id: string;
  type: string;
  title: string | null;
  body: string | null;
  payload: Record<string, unknown>;
  sent_at: string;
  read_at: string | null;
}

// === Read notifications ===

export async function getUnreadNotifications(): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { notifications: [], unreadCount: 0 };

  const { data, count } = await supabase
    .from("notification_log")
    .select("id, type, title, body, payload, sent_at, read_at", { count: "exact" })
    .eq("user_id", user.id)
    .is("read_at", null)
    .order("sent_at", { ascending: false })
    .limit(20);

  return {
    notifications: (data ?? []) as Notification[],
    unreadCount: count ?? 0,
  };
}

export async function getRecentNotifications(): Promise<Notification[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("notification_log")
    .select("id, type, title, body, payload, sent_at, read_at")
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false })
    .limit(30);

  return (data ?? []) as Notification[];
}

export async function markNotificationsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("notification_log")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
}

// === Notification Preferences ===

export async function getNotificationPreferences() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // 如果沒有偏好設定，建立預設值
  if (!data) {
    const { data: created } = await supabase
      .from("notification_preferences")
      .insert({ user_id: user.id })
      .select()
      .single();
    return created;
  }

  return data;
}

export async function updateNotificationPreferences(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "請先登入" };

  const updates = {
    daily_reminder_enabled: formData.get("daily_reminder_enabled") === "true",
    friend_checkin_enabled: formData.get("friend_checkin_enabled") === "true",
    battle_invite_enabled: formData.get("battle_invite_enabled") === "true",
    boss_battle_enabled: formData.get("boss_battle_enabled") === "true",
    weekly_summary_enabled: formData.get("weekly_summary_enabled") === "true",
  };

  const { error } = await supabase
    .from("notification_preferences")
    .upsert({ user_id: user.id, ...updates });

  if (error) return { error: error.message };
  return { success: true };
}

// === Create notifications (internal, uses admin client) ===

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  payload: Record<string, unknown> = {}
) {
  const admin = getSupabaseAdmin();

  await admin.from("notification_log").insert({
    user_id: userId,
    type,
    title,
    body,
    payload,
  });
}

/**
 * 發送通知給多個用戶（批次）
 */
export async function createNotificationBatch(
  userIds: string[],
  type: NotificationType,
  title: string,
  body: string,
  payload: Record<string, unknown> = {}
) {
  if (userIds.length === 0) return;
  const admin = getSupabaseAdmin();

  const rows = userIds.map((userId) => ({
    user_id: userId,
    type,
    title,
    body,
    payload,
  }));

  await admin.from("notification_log").insert(rows);
}
