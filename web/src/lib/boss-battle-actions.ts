"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getBossForWeek } from "@/lib/bosses";
import { grantReward } from "@/lib/reward-actions";
import { REWARDS } from "shared/constants/rewards";
import { checkAchievements } from "@/lib/achievement-actions";

function getSupabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Helper: get current week's Monday and Sunday in Asia/Taipei
function getCurrentWeekBounds(): { weekStart: string; weekEnd: string; weekStartDate: Date } {
  const now = new Date();
  const taipeiDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
  const day = taipeiDate.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0 offset

  const monday = new Date(taipeiDate);
  monday.setDate(taipeiDate.getDate() - diff);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    weekStart: monday.toLocaleDateString("en-CA"),
    weekEnd: sunday.toLocaleDateString("en-CA"),
    weekStartDate: monday,
  };
}

/**
 * Get or lazily create the weekly boss for a challenge.
 * Also settles any expired bosses from previous weeks.
 */
export async function getOrCreateWeeklyBoss(challengeId: string) {
  const supabase = await createClient();
  const admin = getSupabaseAdmin();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "請先登入" };

  const { weekStart, weekEnd, weekStartDate } = getCurrentWeekBounds();

  // Settle any expired bosses from previous weeks
  await admin
    .from("boss_battles")
    .update({ status: "expired" })
    .eq("challenge_id", challengeId)
    .eq("status", "active")
    .lt("week_end", weekStart);

  // Check if boss already exists for this week
  const { data: existing } = await supabase
    .from("boss_battles")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("week_start", weekStart)
    .single();

  if (existing) {
    return { success: true, data: existing };
  }

  // Count challenge members for HP calculation
  const { count } = await supabase
    .from("challenge_members")
    .select("*", { count: "exact", head: true })
    .eq("challenge_id", challengeId);

  const memberCount = count ?? 1;
  const maxHp = memberCount * 2000;

  // Pick boss deterministically
  const boss = getBossForWeek(weekStartDate);

  // Create boss using admin client (bypasses RLS)
  const { data: newBoss, error } = await admin
    .from("boss_battles")
    .upsert(
      {
        challenge_id: challengeId,
        boss_name: boss.name,
        boss_emoji: boss.emoji,
        boss_description: boss.description,
        boss_color: boss.color,
        max_hp: maxHp,
        current_hp: maxHp,
        week_start: weekStart,
        week_end: weekEnd,
        status: "active",
      },
      { onConflict: "challenge_id,week_start", ignoreDuplicates: true }
    )
    .select()
    .single();

  if (error) {
    // If upsert was a no-op (race condition), fetch existing
    const { data: raceResult } = await supabase
      .from("boss_battles")
      .select("*")
      .eq("challenge_id", challengeId)
      .eq("week_start", weekStart)
      .single();

    if (raceResult) return { success: true, data: raceResult };
    return { error: error.message };
  }

  return { success: true, data: newBoss };
}

/**
 * Get current boss battle with damage contributions per member.
 */
export async function getCurrentBossBattle(challengeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "請先登入" };

  // Ensure boss exists
  const bossResult = await getOrCreateWeeklyBoss(challengeId);
  if ("error" in bossResult) return bossResult;

  const boss = bossResult.data;

  // Get damage contributions grouped by user
  const { data: damageRows } = await supabase
    .from("boss_damage_log")
    .select("user_id, damage")
    .eq("boss_battle_id", boss.id);

  // Aggregate by user
  const damageMap: Record<string, number> = {};
  let totalDamage = 0;
  for (const row of damageRows ?? []) {
    damageMap[row.user_id] = (damageMap[row.user_id] ?? 0) + row.damage;
    totalDamage += row.damage;
  }

  // Get member profiles
  const { data: members } = await supabase
    .from("challenge_members")
    .select("user_id, profiles(nickname, avatar_url)")
    .eq("challenge_id", challengeId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contributions = (members ?? []).map((m: any) => ({
    user_id: m.user_id,
    nickname: m.profiles?.nickname ?? "匿名",
    avatar_url: m.profiles?.avatar_url ?? null,
    total_damage: damageMap[m.user_id] ?? 0,
  })).sort((a, b) => b.total_damage - a.total_damage);

  // Calculate time remaining
  const now = new Date();
  const taipeiNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
  const weekEnd = new Date(`${boss.week_end}T23:59:59`);
  const msRemaining = Math.max(0, weekEnd.getTime() - taipeiNow.getTime());
  const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
  const daysRemaining = Math.floor(hoursRemaining / 24);
  const hours = hoursRemaining % 24;

  return {
    success: true,
    data: {
      ...boss,
      contributions,
      total_damage_dealt: totalDamage,
      days_remaining: daysRemaining,
      hours_remaining: hours,
    },
  };
}

/**
 * Deal damage to the boss from a check-in.
 * Called from createCheckIn after feed items are created.
 */
export async function dealBossDamage(
  checkInId: string,
  challengeId: string,
  caloriesBurned: number
) {
  const supabase = await createClient();
  const admin = getSupabaseAdmin();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { weekStart } = getCurrentWeekBounds();

  // Find active boss for this challenge and week
  const { data: boss } = await supabase
    .from("boss_battles")
    .select("id, current_hp, status")
    .eq("challenge_id", challengeId)
    .eq("week_start", weekStart)
    .eq("status", "active")
    .single();

  if (!boss) return; // No active boss

  // Insert damage log (unique on check_in_id prevents double-counting)
  const { error: logError } = await supabase
    .from("boss_damage_log")
    .insert({
      boss_battle_id: boss.id,
      user_id: user.id,
      check_in_id: checkInId,
      damage: caloriesBurned,
    });

  if (logError) return; // Already logged (duplicate check_in_id)

  // Decrement boss HP using admin client (atomic update)
  const newHp = Math.max(0, boss.current_hp - caloriesBurned);

  if (newHp <= 0) {
    // Boss defeated!
    await admin
      .from("boss_battles")
      .update({
        current_hp: 0,
        status: "defeated",
        defeated_at: new Date().toISOString(),
      })
      .eq("id", boss.id)
      .eq("status", "active"); // idempotent guard

    // Grant boss defeat reward to all challenge members
    const { data: members } = await admin
      .from("challenge_members")
      .select("user_id")
      .eq("challenge_id", challengeId);

    if (members) {
      await Promise.all(
        members.map((m) =>
          grantReward(m.user_id, REWARDS.BOSS_DEFEAT.xp, REWARDS.BOSS_DEFEAT.coins)
        )
      );
      // Check boss-related achievements for all members
      members.forEach((m) => checkAchievements(m.user_id, "boss_defeat"));
    }
  } else {
    await admin
      .from("boss_battles")
      .update({ current_hp: newHp })
      .eq("id", boss.id)
      .eq("status", "active");
  }
}

/**
 * Get boss battle history for a challenge.
 */
export async function getBossBattleHistory(challengeId: string, limit: number = 10) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "請先登入" };

  const { data, error } = await supabase
    .from("boss_battles")
    .select("*")
    .eq("challenge_id", challengeId)
    .in("status", ["defeated", "expired"])
    .order("week_start", { ascending: false })
    .limit(limit);

  if (error) return { error: error.message };

  return { success: true, data: data ?? [] };
}
