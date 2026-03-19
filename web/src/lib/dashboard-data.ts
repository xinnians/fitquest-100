"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateStreak } from "shared/utils/streak";

export async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, weight_kg, daily_calorie_goal, timezone, created_at")
    .eq("id", user.id)
    .single();

  // Fetch all check-ins (for streak + waffle)
  const { data: allCheckIns } = await supabase
    .from("check_ins")
    .select("id, exercise_type, duration_minutes, calories_burned, checked_in_at")
    .eq("user_id", user.id)
    .order("checked_in_at", { ascending: true });

  // Fetch today's check-ins
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const todayCheckIns = (allCheckIns ?? []).filter(
    (c) => c.checked_in_at >= startOfDay && c.checked_in_at < endOfDay
  );

  // Fetch today's meals
  const { data: todayMeals } = await supabase
    .from("meals")
    .select("calories")
    .eq("user_id", user.id)
    .gte("eaten_at", startOfDay)
    .lt("eaten_at", endOfDay);

  // Calculate streak
  const timezone = profile?.timezone ?? "Asia/Taipei";
  const checkInDates = (allCheckIns ?? []).map((c) => c.checked_in_at);
  const streak = calculateStreak(checkInDates, timezone);

  // Calculate weekly data (last 7 days)
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-CA");
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString();

    const dayCheckIns = (allCheckIns ?? []).filter(
      (c) => c.checked_in_at >= dayStart && c.checked_in_at < dayEnd
    );
    const burned = dayCheckIns.reduce((sum, c) => sum + c.calories_burned, 0);

    weeklyData.push({
      date: dateStr,
      label: date.toLocaleDateString("zh-TW", { weekday: "short" }),
      burned,
    });
  }

  // Today's totals
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
