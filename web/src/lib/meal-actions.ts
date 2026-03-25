"use server";

import { createClient } from "@/lib/supabase/server";
import { grantReward } from "@/lib/reward-actions";
import { REWARDS } from "shared/constants/rewards";

export async function createMeal(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  const mealType = formData.get("meal_type") as string;
  const foodName = formData.get("food_name") as string;
  const calories = parseInt(formData.get("calories") as string, 10);
  const proteinG = parseFloat(formData.get("protein_g") as string) || null;
  const carbsG = parseFloat(formData.get("carbs_g") as string) || null;
  const fatG = parseFloat(formData.get("fat_g") as string) || null;

  if (!mealType || !foodName || isNaN(calories)) {
    return { error: "請填寫完整的飲食資訊" };
  }

  const { error } = await supabase.from("meals").insert({
    user_id: user.id,
    meal_type: mealType,
    food_name: foodName,
    calories,
    protein_g: proteinG,
    carbs_g: carbsG,
    fat_g: fatG,
  });

  if (error) {
    return { error: error.message };
  }

  // Grant XP and coins for meal logging
  const reward = await grantReward(user.id, REWARDS.MEAL_LOG.xp, REWARDS.MEAL_LOG.coins);

  return { success: true, reward };
}

export async function getTodayMeals() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const { data } = await supabase
    .from("meals")
    .select("*")
    .eq("user_id", user.id)
    .gte("eaten_at", startOfDay)
    .lt("eaten_at", endOfDay)
    .order("eaten_at", { ascending: true });

  return data ?? [];
}

export async function deleteMeal(mealId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "請先登入" };

  const { error } = await supabase
    .from("meals")
    .delete()
    .eq("id", mealId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
