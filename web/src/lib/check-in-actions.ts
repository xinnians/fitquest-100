"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateCaloriesBurned } from "shared/utils/calories";
import { EXERCISE_TYPE_MAP } from "shared/constants/exercise-types";
import { dealBossDamage } from "@/lib/boss-battle-actions";
import { grantReward, getCurrentStreak } from "@/lib/reward-actions";
import { REWARDS } from "shared/constants/rewards";
import { createNotificationBatch } from "@/lib/notification-actions";
import { checkAchievements } from "@/lib/achievement-actions";

export async function createCheckIn(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  const exerciseType = formData.get("exercise_type") as string;
  const durationMinutes = parseInt(formData.get("duration_minutes") as string, 10);
  const notes = (formData.get("notes") as string) || null;

  if (!exerciseType || isNaN(durationMinutes) || durationMinutes < 1) {
    return { error: "請填寫完整的運動資訊" };
  }

  // Get user profile for calorie calculation and notifications
  const { data: profile } = await supabase
    .from("profiles")
    .select("weight_kg, nickname")
    .eq("id", user.id)
    .single();

  const weightKg = profile?.weight_kg ?? 70;
  const caloriesBurned = calculateCaloriesBurned(exerciseType, weightKg, durationMinutes);

  const { data, error } = await supabase
    .from("check_ins")
    .insert({
      user_id: user.id,
      exercise_type: exerciseType,
      duration_minutes: durationMinutes,
      calories_burned: caloriesBurned,
      notes,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Auto-create feed items for all challenges the user belongs to
  const { data: memberships } = await supabase
    .from("challenge_members")
    .select("challenge_id")
    .eq("user_id", user.id);

  if (memberships && memberships.length > 0) {
    const exerciseLabel = EXERCISE_TYPE_MAP.get(exerciseType)?.label ?? exerciseType;
    const feedItems = memberships.map((m) => ({
      user_id: user.id,
      challenge_id: m.challenge_id,
      type: "check_in",
      content: {
        exercise_type: exerciseType,
        exercise_label: exerciseLabel,
        duration_minutes: durationMinutes,
        calories_burned: caloriesBurned,
      },
    }));
    await supabase.from("feed_items").insert(feedItems);

    // Deal boss damage for each challenge
    await Promise.all(
      memberships.map((m) =>
        dealBossDamage(data.id, m.challenge_id, caloriesBurned)
      )
    );

    // Notify challenge peers about this check-in
    const nickname = profile?.nickname ?? "冒險者";
    const { data: peers } = await supabase
      .from("challenge_members")
      .select("user_id")
      .in("challenge_id", memberships.map((m) => m.challenge_id))
      .neq("user_id", user.id);

    if (peers && peers.length > 0) {
      const peerIds = [...new Set(peers.map((p) => p.user_id))];
      const exerciseLabel = EXERCISE_TYPE_MAP.get(exerciseType)?.label ?? exerciseType;
      createNotificationBatch(
        peerIds,
        "friend_checked_in",
        `${nickname} 完成打卡！`,
        `${exerciseLabel} ${durationMinutes} 分鐘，消耗 ${caloriesBurned} kcal`
      );
    }
  }

  // Grant XP and coins for check-in
  const streak = await getCurrentStreak(user.id);
  const reward = await grantReward(
    user.id,
    REWARDS.CHECK_IN.xp,
    REWARDS.CHECK_IN.coins,
    streak
  );

  // Check achievements (deferred — don't block the check-in response)
  setTimeout(() => checkAchievements(user.id, "check_in"), 0);

  return { success: true, data, reward };
}

export async function getTodayCheckIns() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const { data } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", user.id)
    .gte("checked_in_at", startOfDay)
    .lt("checked_in_at", endOfDay)
    .order("checked_in_at", { ascending: false });

  return data ?? [];
}

export async function getCheckInHistory(days: number = 100) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from("check_ins")
    .select("id, exercise_type, duration_minutes, calories_burned, checked_in_at")
    .eq("user_id", user.id)
    .gte("checked_in_at", startDate.toISOString())
    .order("checked_in_at", { ascending: true });

  return data ?? [];
}
