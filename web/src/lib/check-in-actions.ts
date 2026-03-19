"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateCaloriesBurned } from "shared/utils/calories";

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

  // Get user weight for calorie calculation
  const { data: profile } = await supabase
    .from("profiles")
    .select("weight_kg")
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

  return { success: true, data };
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
