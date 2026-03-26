"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { ACHIEVEMENTS, getAchievement } from "@/lib/achievements";
import { grantReward, getCurrentStreak } from "@/lib/reward-actions";
import { createNotification } from "@/lib/notification-actions";

function getSupabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type AchievementContext =
  | "check_in"
  | "battle_win"
  | "boss_defeat"
  | "join_challenge";

/**
 * 檢查並解鎖成就（只檢查與 context 相關的成就）
 */
export async function checkAchievements(userId: string, context: AchievementContext) {
  const admin = getSupabaseAdmin();

  // Get already unlocked achievements
  const { data: existing } = await admin
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const unlocked = new Set((existing ?? []).map((e) => e.achievement_id));
  const newlyUnlocked: string[] = [];

  // Get relevant IDs to check based on context
  const toCheck = ACHIEVEMENTS.filter((a) => {
    if (unlocked.has(a.id)) return false;
    switch (context) {
      case "check_in":
        return a.category === "streak" || a.category === "exercise" || a.category === "calories";
      case "battle_win":
        return a.category === "social" && a.id.startsWith("pk_");
      case "boss_defeat":
        return a.category === "boss";
      case "join_challenge":
        return a.id === "first_challenge";
      default:
        return false;
    }
  });

  if (toCheck.length === 0) return newlyUnlocked;

  // Fetch data needed for checks
  const checks: Record<string, boolean> = {};

  if (toCheck.some((a) => a.category === "streak")) {
    const streak = await getCurrentStreak(userId);
    checks["streak_7"] = streak >= 7;
    checks["streak_14"] = streak >= 14;
    checks["streak_30"] = streak >= 30;
    checks["streak_50"] = streak >= 50;
    checks["streak_100"] = streak >= 100;
  }

  if (toCheck.some((a) => a.category === "exercise")) {
    const types = await getUniqueExerciseTypes(admin, userId);
    checks["exercise_3"] = types >= 3;
    checks["exercise_5"] = types >= 5;
    checks["exercise_10"] = types >= 10;
  }

  if (toCheck.some((a) => a.category === "calories")) {
    const total = await getTotalCaloriesBurned(admin, userId);
    checks["cal_10k"] = total >= 10000;
    checks["cal_50k"] = total >= 50000;
    checks["cal_100k"] = total >= 100000;
  }

  if (toCheck.some((a) => a.id.startsWith("pk_"))) {
    const wins = await getPkWins(admin, userId);
    checks["pk_first_win"] = wins >= 1;
    checks["pk_5_wins"] = wins >= 5;
    checks["pk_10_wins"] = wins >= 10;
  }

  if (toCheck.some((a) => a.category === "boss")) {
    const defeats = await getBossDefeats(admin, userId);
    checks["boss_1"] = defeats >= 1;
    checks["boss_5"] = defeats >= 5;
    checks["boss_10"] = defeats >= 10;
  }

  if (toCheck.some((a) => a.id === "first_challenge")) {
    const { count } = await admin
      .from("challenge_members")
      .select("challenge_id", { count: "exact", head: true })
      .eq("user_id", userId);
    checks["first_challenge"] = (count ?? 0) >= 1;
  }

  // Unlock achieved
  for (const achievement of toCheck) {
    if (checks[achievement.id]) {
      const { error } = await admin
        .from("user_achievements")
        .insert({ user_id: userId, achievement_id: achievement.id })
        .select()
        .single();

      if (!error) {
        newlyUnlocked.push(achievement.id);
        // Grant reward
        await grantReward(userId, achievement.xpReward, achievement.coinReward);
        // Send notification
        createNotification(
          userId,
          "achievement_unlocked",
          `🏆 成就解鎖：${achievement.name}`,
          `${achievement.description} — 獲得 ${achievement.xpReward} XP 和 ${achievement.coinReward} 金幣！`
        );
      }
    }
  }

  return newlyUnlocked;
}

/**
 * 取得用戶已解鎖的成就
 */
export async function getMyAchievements() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at")
    .eq("user_id", user.id)
    .order("unlocked_at", { ascending: false });

  return data ?? [];
}

// === Helper queries ===

async function getUniqueExerciseTypes(admin: ReturnType<typeof getSupabaseAdmin>, userId: string): Promise<number> {
  const { data } = await admin
    .from("check_ins")
    .select("exercise_type")
    .eq("user_id", userId);
  return new Set((data ?? []).map((d) => d.exercise_type)).size;
}

async function getTotalCaloriesBurned(admin: ReturnType<typeof getSupabaseAdmin>, userId: string): Promise<number> {
  const { data } = await admin
    .from("check_ins")
    .select("calories_burned")
    .eq("user_id", userId);
  return (data ?? []).reduce((sum, d) => sum + (d.calories_burned ?? 0), 0);
}

async function getPkWins(admin: ReturnType<typeof getSupabaseAdmin>, userId: string): Promise<number> {
  const { count } = await admin
    .from("battles")
    .select("id", { count: "exact", head: true })
    .eq("winner_id", userId)
    .eq("status", "completed");
  return count ?? 0;
}

async function getBossDefeats(admin: ReturnType<typeof getSupabaseAdmin>, userId: string): Promise<number> {
  // Count boss battles defeated in challenges the user is a member of
  const { data: memberChallenges } = await admin
    .from("challenge_members")
    .select("challenge_id")
    .eq("user_id", userId);

  if (!memberChallenges || memberChallenges.length === 0) return 0;

  const challengeIds = memberChallenges.map((m) => m.challenge_id);
  const { count } = await admin
    .from("boss_battles")
    .select("id", { count: "exact", head: true })
    .in("challenge_id", challengeIds)
    .eq("status", "defeated");

  return count ?? 0;
}
