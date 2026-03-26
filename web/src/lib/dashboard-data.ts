"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateStreak } from "shared/utils/streak";

/**
 * 合併的 Dashboard 資料查詢
 * 1 次 auth + 1 次 profile + 1 次 check_ins + 1 次 meals = 4 queries total
 */
async function getDashboardBase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 平行查詢：profile + check_ins + today meals
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const [profileResult, checkInsResult, mealsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("nickname, daily_calorie_goal, timezone, created_at, character_id, xp, level, coins")
      .eq("id", user.id)
      .single(),
    supabase
      .from("check_ins")
      .select("calories_burned, checked_in_at")
      .eq("user_id", user.id)
      .order("checked_in_at", { ascending: true }),
    supabase
      .from("meals")
      .select("calories")
      .eq("user_id", user.id)
      .gte("eaten_at", startOfDay)
      .lt("eaten_at", endOfDay),
  ]);

  const profile = profileResult.data;
  const allCheckIns = checkInsResult.data ?? [];
  const todayMeals = mealsResult.data ?? [];
  const timezone = profile?.timezone ?? "Asia/Taipei";

  // 預計算共用資料
  const checkInDates = allCheckIns.map((c) => c.checked_in_at);
  const streak = calculateStreak(checkInDates, timezone);
  const todayCheckIns = allCheckIns.filter(
    (c) => c.checked_in_at >= startOfDay && c.checked_in_at < endOfDay
  );

  return { profile, allCheckIns, todayCheckIns, todayMeals, streak, timezone, startOfDay };
}

// 模組級 cache（同一個 request 內共用）
let _cache: ReturnType<typeof getDashboardBase> | null = null;

function getCachedBase() {
  if (!_cache) {
    _cache = getDashboardBase();
    // 每個 server request 結束後清除
    Promise.resolve().then(() => { _cache = null; });
  }
  return _cache;
}

/** Header data */
export async function getHeaderData() {
  const base = await getCachedBase();
  if (!base) return null;

  return {
    nickname: base.profile?.nickname ?? null,
    hasCheckedIn: base.todayCheckIns.length > 0,
    dailyCalorieGoal: base.profile?.daily_calorie_goal ?? 2000,
    timezone: base.timezone,
    challengeStartDate: base.profile?.created_at?.split("T")[0] ?? new Date().toLocaleDateString("en-CA"),
    characterId: base.profile?.character_id ?? "flamey",
  };
}

/** Streak data */
export async function getStreakData() {
  const base = await getCachedBase();
  if (!base) return null;

  return {
    currentStreak: base.streak.currentStreak,
    longestStreak: base.streak.longestStreak,
    totalDays: base.streak.totalDays,
  };
}

/** Calorie data */
export async function getCalorieData() {
  const base = await getCachedBase();
  if (!base) return null;

  return {
    burned: base.todayCheckIns.reduce((sum, c) => sum + c.calories_burned, 0),
    consumed: base.todayMeals.reduce((sum, m) => sum + m.calories, 0),
    goal: base.profile?.daily_calorie_goal ?? 2000,
  };
}

/** Waffle chart data */
export async function getWaffleData() {
  const base = await getCachedBase();
  if (!base) return null;

  return {
    startDate: base.profile?.created_at?.split("T")[0] ?? new Date().toLocaleDateString("en-CA"),
    checkedInDates: Array.from(base.streak.checkedInDates),
  };
}

/** Weekly chart data */
export async function getWeeklyData() {
  const base = await getCachedBase();
  if (!base) return null;

  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString();

    const dayCheckIns = base.allCheckIns.filter(
      (c) => c.checked_in_at >= dayStart && c.checked_in_at < dayEnd
    );
    const burned = dayCheckIns.reduce((sum, c) => sum + c.calories_burned, 0);

    weeklyData.push({
      date: date.toLocaleDateString("en-CA"),
      label: date.toLocaleDateString("zh-TW", { weekday: "short" }),
      burned,
    });
  }

  return weeklyData;
}

/** Player stats (XP/level/coins) — 從同一個 profile query 取得 */
export async function getPlayerStats() {
  const base = await getCachedBase();
  if (!base) return null;

  return {
    xp: base.profile?.xp ?? 0,
    level: base.profile?.level ?? 1,
    coins: base.profile?.coins ?? 0,
  };
}
