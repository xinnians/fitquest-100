"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateStreak } from "shared/utils/streak";

/** Minimal header data — fast query */
export async function getHeaderData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, daily_calorie_goal, timezone, created_at")
    .eq("id", user.id)
    .single();

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const { count } = await supabase
    .from("check_ins")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("checked_in_at", startOfDay)
    .lt("checked_in_at", endOfDay);

  return {
    nickname: profile?.nickname ?? null,
    hasCheckedIn: (count ?? 0) > 0,
    dailyCalorieGoal: profile?.daily_calorie_goal ?? 2000,
    timezone: profile?.timezone ?? "Asia/Taipei",
    challengeStartDate: profile?.created_at?.split("T")[0] ?? new Date().toLocaleDateString("en-CA"),
  };
}

/** Streak data */
export async function getStreakData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();

  const { data: allCheckIns } = await supabase
    .from("check_ins")
    .select("checked_in_at")
    .eq("user_id", user.id)
    .order("checked_in_at", { ascending: true });

  const timezone = profile?.timezone ?? "Asia/Taipei";
  const checkInDates = (allCheckIns ?? []).map((c) => c.checked_in_at);
  const streak = calculateStreak(checkInDates, timezone);

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    totalDays: streak.totalDays,
  };
}

/** Today's calorie data */
export async function getCalorieData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_calorie_goal")
    .eq("id", user.id)
    .single();

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const { data: todayCheckIns } = await supabase
    .from("check_ins")
    .select("calories_burned")
    .eq("user_id", user.id)
    .gte("checked_in_at", startOfDay)
    .lt("checked_in_at", endOfDay);

  const { data: todayMeals } = await supabase
    .from("meals")
    .select("calories")
    .eq("user_id", user.id)
    .gte("eaten_at", startOfDay)
    .lt("eaten_at", endOfDay);

  return {
    burned: (todayCheckIns ?? []).reduce((sum, c) => sum + c.calories_burned, 0),
    consumed: (todayMeals ?? []).reduce((sum, m) => sum + m.calories, 0),
    goal: profile?.daily_calorie_goal ?? 2000,
  };
}

/** Waffle chart data */
export async function getWaffleData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone, created_at")
    .eq("id", user.id)
    .single();

  const { data: allCheckIns } = await supabase
    .from("check_ins")
    .select("checked_in_at")
    .eq("user_id", user.id)
    .order("checked_in_at", { ascending: true });

  const timezone = profile?.timezone ?? "Asia/Taipei";
  const checkInDates = (allCheckIns ?? []).map((c) => c.checked_in_at);
  const streak = calculateStreak(checkInDates, timezone);

  return {
    startDate: profile?.created_at?.split("T")[0] ?? new Date().toLocaleDateString("en-CA"),
    checkedInDates: Array.from(streak.checkedInDates),
  };
}

/** Weekly chart data */
export async function getWeeklyData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: allCheckIns } = await supabase
    .from("check_ins")
    .select("calories_burned, checked_in_at")
    .eq("user_id", user.id)
    .order("checked_in_at", { ascending: true });

  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString();

    const dayCheckIns = (allCheckIns ?? []).filter(
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

/** Legacy: full dashboard data (kept for backward compatibility) */
export async function getDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, weight_kg, daily_calorie_goal, timezone, created_at")
    .eq("id", user.id)
    .single();

  const { data: allCheckIns } = await supabase
    .from("check_ins")
    .select("id, exercise_type, duration_minutes, calories_burned, checked_in_at")
    .eq("user_id", user.id)
    .order("checked_in_at", { ascending: true });

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const todayCheckIns = (allCheckIns ?? []).filter(
    (c) => c.checked_in_at >= startOfDay && c.checked_in_at < endOfDay
  );

  const { data: todayMeals } = await supabase
    .from("meals")
    .select("calories")
    .eq("user_id", user.id)
    .gte("eaten_at", startOfDay)
    .lt("eaten_at", endOfDay);

  const timezone = profile?.timezone ?? "Asia/Taipei";
  const checkInDates = (allCheckIns ?? []).map((c) => c.checked_in_at);
  const streak = calculateStreak(checkInDates, timezone);

  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString();

    const dayCheckIns = (allCheckIns ?? []).filter(
      (c) => c.checked_in_at >= dayStart && c.checked_in_at < dayEnd
    );
    const burned = dayCheckIns.reduce((sum, c) => sum + c.calories_burned, 0);

    weeklyData.push({
      date: date.toLocaleDateString("en-CA"),
      label: date.toLocaleDateString("zh-TW", { weekday: "short" }),
      burned,
    });
  }

  const todayCaloriesBurned = todayCheckIns.reduce((sum, c) => sum + c.calories_burned, 0);
  const todayCaloriesConsumed = (todayMeals ?? []).reduce((sum, m) => sum + m.calories, 0);

  return {
    profile,
    streak: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalDays: streak.totalDays,
      checkedInDates: Array.from(streak.checkedInDates),
    },
    today: {
      hasCheckedIn: todayCheckIns.length > 0,
      checkInCount: todayCheckIns.length,
      caloriesBurned: todayCaloriesBurned,
      caloriesConsumed: todayCaloriesConsumed,
      caloriesGoal: profile?.daily_calorie_goal ?? 2000,
    },
    weeklyData,
    challengeStartDate: profile?.created_at?.split("T")[0] ?? new Date().toLocaleDateString("en-CA"),
  };
}
