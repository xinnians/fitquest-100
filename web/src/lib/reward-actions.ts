"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { calculateLevel, REWARDS, getStreakMultiplier } from "shared/constants/rewards";

function getSupabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface RewardResult {
  xp: number;
  coins: number;
  totalXp: number;
  totalCoins: number;
  leveledUp: boolean;
  newLevel: number;
}

/**
 * 發放 XP 和金幣獎勵（原子操作）
 * 使用 admin client 呼叫 grant_reward DB function
 */
export async function grantReward(
  userId: string,
  baseXp: number,
  baseCoins: number,
  streakDays?: number
): Promise<RewardResult> {
  const admin = getSupabaseAdmin();

  // 先取得當前等級，用於判斷是否升級
  const { data: profile } = await admin
    .from("profiles")
    .select("xp, level, coins")
    .eq("id", userId)
    .single();

  const oldLevel = profile?.level ?? 1;

  // 計算 streak 加成
  const multiplier = streakDays ? getStreakMultiplier(streakDays) : 1.0;
  const xp = Math.round(baseXp * multiplier);
  const coins = Math.round(baseCoins * multiplier);

  // 原子化更新
  const { data } = await admin.rpc("grant_reward", {
    p_user_id: userId,
    p_xp: xp,
    p_coins: coins,
  });

  const totalXp = data?.xp ?? (profile?.xp ?? 0) + xp;
  const totalCoins = data?.coins ?? (profile?.coins ?? 0) + coins;

  // 計算新等級
  const newLevel = calculateLevel(totalXp);
  const leveledUp = newLevel > oldLevel;

  // 如果升級，更新 level 欄位
  if (leveledUp) {
    await admin
      .from("profiles")
      .update({ level: newLevel })
      .eq("id", userId);
  }

  return { xp, coins, totalXp, totalCoins, leveledUp, newLevel };
}

/**
 * 取得玩家的 XP / 等級 / 金幣狀態
 */
export async function getPlayerStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("xp, level, coins")
    .eq("id", user.id)
    .single();

  return data;
}

/**
 * 取得用戶當前 streak 天數（用於計算加成）
 */
export async function getCurrentStreak(userId: string): Promise<number> {
  const admin = getSupabaseAdmin();

  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 200; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().slice(0, 10);

    const { count } = await admin
      .from("check_ins")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("checked_in_at", `${dateStr}T00:00:00`)
      .lt("checked_in_at", `${dateStr}T23:59:59.999`);

    if ((count ?? 0) > 0) {
      streak++;
    } else if (i === 0) {
      // 今天還沒打卡也沒關係，往前看
      continue;
    } else {
      break;
    }
  }

  return streak;
}
