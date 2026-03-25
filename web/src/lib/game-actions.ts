"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { EXERCISE_TYPES } from "shared/constants/exercise-types";
import { QUIZ_FOODS } from "shared/constants/quiz-foods";
import { grantReward } from "@/lib/reward-actions";

function getSupabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getTodayDateString() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
}

// === Game Status ===

export async function getGameStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_wheel_date, last_quiz_date, wheel_exercise_type")
    .eq("id", user.id)
    .single();

  const today = getTodayDateString();

  return {
    wheelPlayedToday: profile?.last_wheel_date === today,
    quizPlayedToday: profile?.last_quiz_date === today,
    wheelExerciseType: profile?.wheel_exercise_type ?? null,
  };
}

// === Exercise Wheel ===

export async function spinWheel() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "請先登入" };

  // Check daily limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("last_wheel_date")
    .eq("id", user.id)
    .single();

  const today = getTodayDateString();
  if (profile?.last_wheel_date === today) {
    return { error: "今天已經轉過了，明天再來！" };
  }

  // Pick random exercise
  const exercise = EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)];

  // Update profile
  const admin = getSupabaseAdmin();
  await admin
    .from("profiles")
    .update({
      last_wheel_date: today,
      wheel_exercise_type: exercise.id,
    })
    .eq("id", user.id);

  return {
    success: true,
    exercise: { id: exercise.id, label: exercise.label, emoji: exercise.emoji },
  };
}

/**
 * 完成轉盤指定的運動後領取獎勵
 */
export async function claimWheelReward() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "請先登入" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("wheel_exercise_type, last_wheel_date")
    .eq("id", user.id)
    .single();

  const today = getTodayDateString();
  if (profile?.last_wheel_date !== today || !profile.wheel_exercise_type) {
    return { error: "沒有待完成的轉盤任務" };
  }

  // Check if user did this exercise type today
  const startOfDay = `${today}T00:00:00`;
  const endOfDay = `${today}T23:59:59.999`;

  const { count } = await supabase
    .from("check_ins")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("exercise_type", profile.wheel_exercise_type)
    .gte("checked_in_at", startOfDay)
    .lt("checked_in_at", endOfDay);

  if ((count ?? 0) === 0) {
    return { error: "還沒完成指定運動，先去打卡吧！" };
  }

  // Grant reward
  const reward = await grantReward(user.id, 150, 15);

  // Clear the wheel task
  const admin = getSupabaseAdmin();
  await admin
    .from("profiles")
    .update({ wheel_exercise_type: null })
    .eq("id", user.id);

  return { success: true, reward };
}

// === Calorie Quiz ===

export async function getQuizQuestion() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Check daily limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("last_quiz_date")
    .eq("id", user.id)
    .single();

  const today = getTodayDateString();
  if (profile?.last_quiz_date === today) {
    return { played: true };
  }

  // Pick random food
  const food = QUIZ_FOODS[Math.floor(Math.random() * QUIZ_FOODS.length)];

  return {
    played: false,
    food: {
      name: food.name,
      emoji: food.emoji,
      serving: food.serving,
      // Don't send the answer!
    },
    foodIndex: QUIZ_FOODS.indexOf(food),
  };
}

export async function submitQuizAnswer(foodIndex: number, guessedCalories: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "請先登入" };

  // Check daily limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("last_quiz_date")
    .eq("id", user.id)
    .single();

  const today = getTodayDateString();
  if (profile?.last_quiz_date === today) {
    return { error: "今天已經玩過了！" };
  }

  const food = QUIZ_FOODS[foodIndex];
  if (!food) return { error: "無效的題目" };

  const actual = food.calories;
  const diff = Math.abs(guessedCalories - actual);
  const accuracy = Math.max(0, 1 - diff / actual);

  // Score: within 10% = full points, within 25% = half, else = base
  let xp = 20;
  let coins = 2;
  let grade: "perfect" | "good" | "ok" = "ok";

  if (accuracy >= 0.9) {
    xp = 50;
    coins = 5;
    grade = "perfect";
  } else if (accuracy >= 0.75) {
    xp = 35;
    coins = 3;
    grade = "good";
  }

  // Update daily limit
  const admin = getSupabaseAdmin();
  await admin
    .from("profiles")
    .update({ last_quiz_date: today })
    .eq("id", user.id);

  // Grant reward
  const reward = await grantReward(user.id, xp, coins);

  return {
    success: true,
    actual,
    guessed: guessedCalories,
    accuracy: Math.round(accuracy * 100),
    grade,
    reward,
  };
}
