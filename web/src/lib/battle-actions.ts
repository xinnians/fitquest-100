"use server";

import { createClient } from "@/lib/supabase/server";

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

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 7);

  const { data, error } = await supabase
    .from("battles")
    .insert({
      challenger_id: user.id,
      opponent_id: opponentId,
      metric,
      stake_description: stakeDescription,
      start_date: today.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
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

  // Fetch the battle to verify the current user is the opponent
  const { data: battle, error: fetchError } = await supabase
    .from("battles")
    .select("opponent_id, status")
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

  const newStatus = accept ? "active" : "declined";

  const { error } = await supabase
    .from("battles")
    .update({ status: newStatus })
    .eq("id", battleId);

  if (error) {
    return { error: error.message };
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

  return { success: true, data: data ?? [] };
}

export async function getBattleDetail(battleId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

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

  // Calculate scores based on check_ins within the battle date range
  const startDate = battle.start_date;
  const endDate = battle.end_date;

  let challengerScore = 0;
  let opponentScore = 0;

  if (battle.metric === "check_ins") {
    const [challengerResult, opponentResult] = await Promise.all([
      supabase
        .from("check_ins")
        .select("id", { count: "exact", head: true })
        .eq("user_id", battle.challenger_id)
        .gte("checked_in_at", `${startDate}T00:00:00`)
        .lte("checked_in_at", `${endDate}T23:59:59`),
      supabase
        .from("check_ins")
        .select("id", { count: "exact", head: true })
        .eq("user_id", battle.opponent_id)
        .gte("checked_in_at", `${startDate}T00:00:00`)
        .lte("checked_in_at", `${endDate}T23:59:59`),
    ]);

    challengerScore = challengerResult.count ?? 0;
    opponentScore = opponentResult.count ?? 0;
  } else if (battle.metric === "calories") {
    const [challengerResult, opponentResult] = await Promise.all([
      supabase
        .from("check_ins")
        .select("calories_burned")
        .eq("user_id", battle.challenger_id)
        .gte("checked_in_at", `${startDate}T00:00:00`)
        .lte("checked_in_at", `${endDate}T23:59:59`),
      supabase
        .from("check_ins")
        .select("calories_burned")
        .eq("user_id", battle.opponent_id)
        .gte("checked_in_at", `${startDate}T00:00:00`)
        .lte("checked_in_at", `${endDate}T23:59:59`),
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

  return {
    success: true,
    data: {
      battle,
      challenger_score: challengerScore,
      opponent_score: opponentScore,
    },
  };
}

export async function getPotentialOpponents() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入", data: [] };
  }

  // Get all challenges the user is a member of
  const { data: memberships } = await supabase
    .from("challenge_members")
    .select("challenge_id")
    .eq("user_id", user.id);

  if (!memberships || memberships.length === 0) {
    return { success: true, data: [] };
  }

  const challengeIds = memberships.map((m) => m.challenge_id);

  // Get all members of those challenges (excluding current user)
  const { data: members } = await supabase
    .from("challenge_members")
    .select("user_id, profiles(id, nickname)")
    .in("challenge_id", challengeIds)
    .neq("user_id", user.id);

  if (!members || members.length === 0) {
    return { success: true, data: [] };
  }

  // Deduplicate by user_id
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
