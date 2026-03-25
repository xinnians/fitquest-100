"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateInviteCode } from "shared/utils/invite-code";

export async function createChallenge(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  const name = formData.get("name") as string;

  if (!name || name.trim().length === 0) {
    return { error: "請輸入挑戰名稱" };
  }

  const inviteCode = generateInviteCode();
  const startDate = new Date().toISOString().split("T")[0];
  const endDate = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data: challenge, error } = await supabase
    .from("challenges")
    .insert({
      name: name.trim(),
      invite_code: inviteCode,
      creator_id: user.id,
      start_date: startDate,
      end_date: endDate,
    })
    .select()
    .single();

  console.log("[createChallenge] user:", user.id, "challenge insert:", { id: challenge?.id, error: error?.message });

  if (error) {
    return { error: error.message };
  }

  const { error: memberError } = await supabase
    .from("challenge_members")
    .insert({
      challenge_id: challenge.id,
      user_id: user.id,
    });

  console.log("[createChallenge] member insert:", { challenge_id: challenge.id, error: memberError?.message });

  if (memberError) {
    return { error: memberError.message };
  }

  revalidatePath("/challenges");
  return { success: true, data: challenge };
}

export async function joinChallenge(inviteCode: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  if (!inviteCode || inviteCode.trim().length === 0) {
    return { error: "請輸入邀請碼" };
  }

  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("*")
    .eq("invite_code", inviteCode.trim().toUpperCase())
    .single();

  if (challengeError || !challenge) {
    return { error: "找不到此邀請碼對應的挑戰" };
  }

  const { data: existingMember } = await supabase
    .from("challenge_members")
    .select("id")
    .eq("challenge_id", challenge.id)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    return { error: "你已經是此挑戰的成員" };
  }

  const { error: joinError } = await supabase
    .from("challenge_members")
    .insert({
      challenge_id: challenge.id,
      user_id: user.id,
    });

  if (joinError) {
    return { error: joinError.message };
  }

  await supabase.from("feed_items").insert({
    challenge_id: challenge.id,
    user_id: user.id,
    type: "join",
  });

  revalidatePath("/challenges");
  return { success: true, data: challenge };
}

export async function leaveChallenge(challengeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  const { error } = await supabase
    .from("challenge_members")
    .delete()
    .eq("challenge_id", challengeId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getMyChallenges() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("[getMyChallenges] no user");
    return [];
  }

  const { data: memberships, error: membershipsError } = await supabase
    .from("challenge_members")
    .select("challenge_id, challenges(*)")
    .eq("user_id", user.id);

  console.log("[getMyChallenges] user:", user.id, "memberships:", memberships?.length ?? 0, "error:", membershipsError?.message);

  if (!memberships || memberships.length === 0) return [];

  const challengeIds = memberships.map((m) => m.challenge_id);

  const { data: memberCounts } = await supabase
    .from("challenge_members")
    .select("challenge_id")
    .in("challenge_id", challengeIds);

  const countMap: Record<string, number> = {};
  for (const row of memberCounts ?? []) {
    countMap[row.challenge_id] = (countMap[row.challenge_id] ?? 0) + 1;
  }

  return memberships.map((m) => ({
    ...m.challenges,
    member_count: countMap[m.challenge_id] ?? 0,
  }));
}

export async function getChallengeDetail(challengeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  if (challengeError || !challenge) {
    return { error: "找不到此挑戰" };
  }

  const { data: members } = await supabase
    .from("challenge_members")
    .select("user_id, joined_at, profiles(nickname, avatar_url)")
    .eq("challenge_id", challengeId);

  return {
    success: true,
    data: {
      ...challenge,
      members: members ?? [],
    },
  };
}

export async function getChallengeLeaderboard(
  challengeId: string,
  range: "daily" | "weekly" | "total" = "total"
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  const { data: challenge } = await supabase
    .from("challenges")
    .select("start_date")
    .eq("id", challengeId)
    .single();

  if (!challenge) {
    return { error: "找不到此挑戰" };
  }

  const { data: members } = await supabase
    .from("challenge_members")
    .select("user_id, profiles(nickname, avatar_url)")
    .eq("challenge_id", challengeId);

  if (!members || members.length === 0) {
    return { success: true, data: [] };
  }

  const userIds = members.map((m) => m.user_id);

  // Determine date range based on filter
  let rangeStart: string;
  const now = new Date();
  const taipeiDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));

  if (range === "daily") {
    rangeStart = taipeiDate.toLocaleDateString("en-CA");
  } else if (range === "weekly") {
    // Get Monday of current week (Asia/Taipei)
    const day = taipeiDate.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday = 0 offset
    const monday = new Date(taipeiDate);
    monday.setDate(taipeiDate.getDate() - diff);
    rangeStart = monday.toLocaleDateString("en-CA");
  } else {
    rangeStart = challenge.start_date;
  }

  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("user_id, calories_burned")
    .in("user_id", userIds)
    .gte("checked_in_at", `${rangeStart}T00:00:00+08:00`);

  const statsMap: Record<string, { total_check_ins: number; total_calories_burned: number }> = {};
  for (const uid of userIds) {
    statsMap[uid] = { total_check_ins: 0, total_calories_burned: 0 };
  }
  for (const ci of checkIns ?? []) {
    statsMap[ci.user_id].total_check_ins += 1;
    statsMap[ci.user_id].total_calories_burned += ci.calories_burned ?? 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leaderboard = members
    .map((m: any) => ({
      user_id: m.user_id,
      nickname: m.profiles?.nickname ?? "匿名",
      avatar_url: m.profiles?.avatar_url ?? null,
      total_check_ins: statsMap[m.user_id]?.total_check_ins ?? 0,
      total_calories: statsMap[m.user_id]?.total_calories_burned ?? 0,
    }))
    .sort((a: any, b: any) => b.total_check_ins - a.total_check_ins);

  return { success: true, data: leaderboard };
}
