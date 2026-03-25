"use server";

import { createClient } from "@/lib/supabase/server";
import type { BattleStats } from "shared/types/battle";

// Helper: get today's date string in YYYY-MM-DD (Asia/Taipei)
function getTodayDateString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
}

// Helper: calculate scores for a battle
async function calculateBattleScores(
  supabase: Awaited<ReturnType<typeof createClient>>,
  battle: { challenger_id: string; opponent_id: string; metric: string; start_date: string; end_date: string }
) {
  let challengerScore = 0;
  let opponentScore = 0;

  if (battle.metric === "check_ins") {
    const [challengerResult, opponentResult] = await Promise.all([
      supabase
        .from("check_ins")
        .select("id", { count: "exact", head: true })
        .eq("user_id", battle.challenger_id)
        .gte("checked_in_at", `${battle.start_date}T00:00:00+08:00`)
        .lte("checked_in_at", `${battle.end_date}T23:59:59+08:00`),
      supabase
        .from("check_ins")
        .select("id", { count: "exact", head: true })
        .eq("user_id", battle.opponent_id)
        .gte("checked_in_at", `${battle.start_date}T00:00:00+08:00`)
        .lte("checked_in_at", `${battle.end_date}T23:59:59+08:00`),
    ]);
    challengerScore = challengerResult.count ?? 0;
    opponentScore = opponentResult.count ?? 0;
  } else if (battle.metric === "calories") {
    const [challengerResult, opponentResult] = await Promise.all([
      supabase
        .from("check_ins")
        .select("calories_burned")
        .eq("user_id", battle.challenger_id)
        .gte("checked_in_at", `${battle.start_date}T00:00:00+08:00`)
        .lte("checked_in_at", `${battle.end_date}T23:59:59+08:00`),
      supabase
        .from("check_ins")
        .select("calories_burned")
        .eq("user_id", battle.opponent_id)
        .gte("checked_in_at", `${battle.start_date}T00:00:00+08:00`)
        .lte("checked_in_at", `${battle.end_date}T23:59:59+08:00`),
    ]);
    challengerScore = (challengerResult.data ?? []).reduce(
      (sum, row) => sum + (row.calories_burned ?? 0),
      0
    );
    opponentScore = (opponentResult.data ?? []).reduce(
      (sum, row) => sum + (row.calories_burned ?? 0),
      0
    );
  }

  return { challengerScore, opponentScore };
}

// Complete a battle if its end_date has passed and it's still active
async function completeBattleIfExpired(
  supabase: Awaited<ReturnType<typeof createClient>>,
  battleId: string
) {
  const { data: battle } = await supabase
    .from("battles")
    .select("*")
    .eq("id", battleId)
    .eq("status", "active")
    .single();

  if (!battle) return null;

  const today = getTodayDateString();
  if (battle.end_date >= today) return null;

  const { challengerScore, opponentScore } = await calculateBattleScores(supabase, battle);

  let winnerId: string | null = null;
  if (challengerScore > opponentScore) winnerId = battle.challenger_id;
  else if (opponentScore > challengerScore) winnerId = battle.opponent_id;
  // null = draw

  const { error } = await supabase
    .from("battles")
    .update({ status: "completed", winner_id: winnerId })
    .eq("id", battleId)
    .eq("status", "active"); // idempotent guard

  if (error) return null;

  // Create feed item for battle result (if linked to a challenge)
  if (battle.challenge_id) {
    await supabase.from("feed_items").insert({
      user_id: battle.challenger_id,
      challenge_id: battle.challenge_id,
      type: "battle_result",
      content: {
        battle_id: battle.id,
        challenger_id: battle.challenger_id,
        opponent_id: battle.opponent_id,
        metric: battle.metric,
        challenger_score: challengerScore,
        opponent_score: opponentScore,
        winner_id: winnerId,
        stake_description: battle.stake_description,
      },
    });
  }

  // TODO: grantBattleReward(winnerId, 300, 30) — when XP system is built

  return { winnerId, challengerScore, opponentScore };
}

export async function createBattle(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  const opponentId = formData.get("opponent_id") as string;
  const metric = formData.get("metric") as string;
  const stakeDescription = (formData.get("stake_description") as string) || null;

  if (!opponentId || !metric) {
    return { error: "請填寫完整的對戰資訊" };
  }

  if (metric !== "check_ins" && metric !== "calories") {
    return { error: "無效的對戰指標" };
  }

  if (opponentId === user.id) {
    return { error: "不能向自己發起挑戰" };
  }

  const today = getTodayDateString();
  const endDate = new Date(`${today}T00:00:00+08:00`);
  endDate.setDate(endDate.getDate() + 7);
  const endDateStr = endDate.toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });

  const { data, error } = await supabase
    .from("battles")
    .insert({
      challenger_id: user.id,
      opponent_id: opponentId,
      metric,
      stake_description: stakeDescription,
      start_date: today,
      end_date: endDateStr,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

export async function respondBattle(battleId: string, accept: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  const { data: battle, error: fetchError } = await supabase
    .from("battles")
    .select("opponent_id, status, challenge_id, challenger_id, metric")
    .eq("id", battleId)
    .single();

  if (fetchError || !battle) {
    return { error: "找不到此對戰" };
  }

  if (battle.opponent_id !== user.id) {
    return { error: "只有被挑戰者可以回應" };
  }

  if (battle.status !== "pending") {
    return { error: "此對戰已經被回應過了" };
  }

  if (!accept) {
    const { error } = await supabase
      .from("battles")
      .update({ status: "declined" })
      .eq("id", battleId);

    if (error) return { error: error.message };
    return { success: true };
  }

  // Accept: reset start_date to today, end_date to today + 7
  const today = getTodayDateString();
  const endDate = new Date(`${today}T00:00:00+08:00`);
  endDate.setDate(endDate.getDate() + 7);
  const endDateStr = endDate.toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });

  const { error } = await supabase
    .from("battles")
    .update({
      status: "active",
      start_date: today,
      end_date: endDateStr,
    })
    .eq("id", battleId);

  if (error) return { error: error.message };

  // Create feed item for battle start
  if (battle.challenge_id) {
    await supabase.from("feed_items").insert({
      user_id: battle.challenger_id,
      challenge_id: battle.challenge_id,
      type: "battle_start",
      content: {
        battle_id: battleId,
        challenger_id: battle.challenger_id,
        opponent_id: battle.opponent_id,
        metric: battle.metric,
      },
    });
  }

  return { success: true };
}

export async function getMyBattles() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  const { data, error } = await supabase
    .from("battles")
    .select(
      `
      *,
      challenger:profiles!battles_challenger_id_fkey(id, nickname),
      opponent:profiles!battles_opponent_id_fkey(id, nickname)
    `
    )
    .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  const battles = data ?? [];

  // Auto-complete any expired active battles
  const today = getTodayDateString();
  for (const b of battles) {
    if (b.status === "active" && b.end_date < today) {
      await completeBattleIfExpired(supabase, b.id);
      b.status = "completed";
    }
  }

  return { success: true, data: battles };
}

export async function getBattleDetail(battleId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  // Auto-complete if expired
  await completeBattleIfExpired(supabase, battleId);

  // Fetch battle with profile info
  const { data: battle, error: battleError } = await supabase
    .from("battles")
    .select(
      `
      *,
      challenger:profiles!battles_challenger_id_fkey(id, nickname),
      opponent:profiles!battles_opponent_id_fkey(id, nickname)
    `
    )
    .eq("id", battleId)
    .single();

  if (battleError || !battle) {
    return { error: "找不到此對戰" };
  }

  const { challengerScore, opponentScore } = await calculateBattleScores(supabase, battle);

  // Calculate days remaining
  const today = new Date(getTodayDateString());
  const endDate = new Date(battle.end_date);
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    success: true,
    data: {
      battle,
      challenger_score: challengerScore,
      opponent_score: opponentScore,
      days_remaining: daysRemaining,
    },
  };
}

export async function getBattleStats(): Promise<{ success: true; data: BattleStats } | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  const { data: battles } = await supabase
    .from("battles")
    .select("winner_id, challenger_id, opponent_id")
    .eq("status", "completed")
    .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`);

  const stats: BattleStats = { wins: 0, losses: 0, draws: 0 };

  for (const b of battles ?? []) {
    if (b.winner_id === null) {
      stats.draws++;
    } else if (b.winner_id === user.id) {
      stats.wins++;
    } else {
      stats.losses++;
    }
  }

  return { success: true, data: stats };
}

export async function createRematch(battleId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  const { data: original } = await supabase
    .from("battles")
    .select("challenger_id, opponent_id, metric, stake_description, challenge_id")
    .eq("id", battleId)
    .single();

  if (!original) {
    return { error: "找不到原對戰" };
  }

  // Determine opponent (the other person)
  const opponentId = original.challenger_id === user.id
    ? original.opponent_id
    : original.challenger_id;

  const today = getTodayDateString();
  const endDate = new Date(`${today}T00:00:00+08:00`);
  endDate.setDate(endDate.getDate() + 7);
  const endDateStr = endDate.toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });

  const { data, error } = await supabase
    .from("battles")
    .insert({
      challenger_id: user.id,
      opponent_id: opponentId,
      challenge_id: original.challenge_id,
      metric: original.metric,
      stake_description: original.stake_description,
      start_date: today,
      end_date: endDateStr,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

export async function getPotentialOpponents() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入", data: [] };
  }

  const { data: memberships } = await supabase
    .from("challenge_members")
    .select("challenge_id")
    .eq("user_id", user.id);

  if (!memberships || memberships.length === 0) {
    return { success: true, data: [] };
  }

  const challengeIds = memberships.map((m) => m.challenge_id);

  const { data: members } = await supabase
    .from("challenge_members")
    .select("user_id, profiles(id, nickname)")
    .in("challenge_id", challengeIds)
    .neq("user_id", user.id);

  if (!members || members.length === 0) {
    return { success: true, data: [] };
  }

  const seen = new Set<string>();
  const uniqueMembers = members.filter((m) => {
    if (seen.has(m.user_id)) return false;
    seen.add(m.user_id);
    return true;
  });

  return {
    success: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: uniqueMembers.map((m: any) => ({
      id: m.user_id,
      nickname: m.profiles?.nickname ?? "匿名冒險者",
    })),
  };
}

export async function getCurrentUserId() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}
