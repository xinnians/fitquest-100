"use server";

import { createClient } from "@/lib/supabase/server";

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "請先登入" };

  const nickname = formData.get("nickname") as string;
  const weightKg = parseFloat(formData.get("weight_kg") as string);
  const dailyCalorieGoal = parseInt(formData.get("daily_calorie_goal") as string, 10);
  const gender = formData.get("gender") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      nickname,
      weight_kg: isNaN(weightKg) ? null : weightKg,
      daily_calorie_goal: isNaN(dailyCalorieGoal) ? 2000 : dailyCalorieGoal,
      gender: gender || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function addWeightRecord(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "請先登入" };

  const weightKg = parseFloat(formData.get("weight_kg") as string);
  const bodyFatPct = parseFloat(formData.get("body_fat_pct") as string);

  if (isNaN(weightKg) || weightKg <= 0) return { error: "請輸入有效的體重" };

  const { error } = await supabase.from("weight_records").insert({
    user_id: user.id,
    weight_kg: weightKg,
    body_fat_pct: isNaN(bodyFatPct) ? null : bodyFatPct,
  });

  // Also update profile weight
  await supabase
    .from("profiles")
    .update({ weight_kg: weightKg })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getWeightHistory() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("weight_records")
    .select("*")
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: true })
    .limit(90);

  return data ?? [];
}
