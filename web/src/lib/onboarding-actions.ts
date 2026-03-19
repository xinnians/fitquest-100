"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const nickname = formData.get("nickname") as string;
  const gender = formData.get("gender") as string | null;
  const weightKg = parseFloat(formData.get("weight_kg") as string);
  const dailyCalorieGoal = parseInt(formData.get("daily_calorie_goal") as string, 10);

  const { error } = await supabase
    .from("profiles")
    .update({
      nickname,
      gender: gender || null,
      weight_kg: isNaN(weightKg) ? null : weightKg,
      daily_calorie_goal: isNaN(dailyCalorieGoal) ? 2000 : dailyCalorieGoal,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
