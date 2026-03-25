"use server";

import { createClient } from "@/lib/supabase/server";

interface FeedItemWithMeta {
  id: string;
  user_id: string;
  challenge_id: string | null;
  type: string;
  content: Record<string, unknown>;
  created_at: string;
  nickname: string;
  avatar_url: string | null;
  like_count: number;
  is_liked: boolean;
}

export async function getFeed(challengeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  // Fetch feed items with profile info
  const { data: feedItems, error } = await supabase
    .from("feed_items")
    .select("id, user_id, challenge_id, type, content, created_at, profiles!feed_items_user_id_fkey(nickname, avatar_url)")
    .eq("challenge_id", challengeId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { error: error.message };
  }

  if (!feedItems || feedItems.length === 0) {
    return { success: true, data: [] as FeedItemWithMeta[] };
  }

  const feedItemIds = feedItems.map((item) => item.id);

  // Fetch all likes for these feed items
  const { data: likes } = await supabase
    .from("feed_likes")
    .select("feed_item_id, user_id")
    .in("feed_item_id", feedItemIds);

  // Build like counts and is_liked map
  const likeCountMap: Record<string, number> = {};
  const isLikedMap: Record<string, boolean> = {};

  for (const like of likes ?? []) {
    likeCountMap[like.feed_item_id] = (likeCountMap[like.feed_item_id] ?? 0) + 1;
    if (like.user_id === user.id) {
      isLikedMap[like.feed_item_id] = true;
    }
  }

  // Merge data
  const data: FeedItemWithMeta[] = feedItems.map((item) => {
    const profile = item.profiles as unknown as { nickname: string; avatar_url: string | null } | null;
    return {
      id: item.id,
      user_id: item.user_id,
      challenge_id: item.challenge_id,
      type: item.type,
      content: item.content as Record<string, unknown>,
      created_at: item.created_at,
      nickname: profile?.nickname ?? "",
      avatar_url: profile?.avatar_url ?? null,
      like_count: likeCountMap[item.id] ?? 0,
      is_liked: isLikedMap[item.id] ?? false,
    };
  });

  return { success: true, data };
}

export async function toggleLike(feedItemId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  // Check if the user already liked this feed item
  const { data: existing } = await supabase
    .from("feed_likes")
    .select("feed_item_id")
    .eq("feed_item_id", feedItemId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from("feed_likes")
      .delete()
      .eq("feed_item_id", feedItemId)
      .eq("user_id", user.id);

    if (error) {
      return { error: error.message };
    }

    return { success: true, liked: false };
  } else {
    // Like
    const { error } = await supabase
      .from("feed_likes")
      .insert({ feed_item_id: feedItemId, user_id: user.id });

    if (error) {
      return { error: error.message };
    }

    return { success: true, liked: true };
  }
}

export async function createFeedItem(params: {
  challengeId: string;
  type: string;
  content: Record<string, unknown>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  const { error } = await supabase.from("feed_items").insert({
    user_id: user.id,
    challenge_id: params.challengeId,
    type: params.type,
    content: params.content,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getMyFeed() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "請先登入" };
  }

  // Get all challenge IDs the user belongs to
  const { data: memberships, error: memberError } = await supabase
    .from("challenge_members")
    .select("challenge_id")
    .eq("user_id", user.id);

  if (memberError) {
    return { error: memberError.message };
  }

  if (!memberships || memberships.length === 0) {
    return { success: true, data: [] as FeedItemWithMeta[] };
  }

  const challengeIds = memberships.map((m) => m.challenge_id);

  // Fetch feed items with profile info
  const { data: feedItems, error } = await supabase
    .from("feed_items")
    .select("id, user_id, challenge_id, type, content, created_at, profiles!feed_items_user_id_fkey(nickname, avatar_url)")
    .in("challenge_id", challengeIds)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return { error: error.message };
  }

  if (!feedItems || feedItems.length === 0) {
    return { success: true, data: [] as FeedItemWithMeta[] };
  }

  const feedItemIds = feedItems.map((item) => item.id);

  // Fetch all likes for these feed items
  const { data: likes } = await supabase
    .from("feed_likes")
    .select("feed_item_id, user_id")
    .in("feed_item_id", feedItemIds);

  // Build like counts and is_liked map
  const likeCountMap: Record<string, number> = {};
  const isLikedMap: Record<string, boolean> = {};

  for (const like of likes ?? []) {
    likeCountMap[like.feed_item_id] = (likeCountMap[like.feed_item_id] ?? 0) + 1;
    if (like.user_id === user.id) {
      isLikedMap[like.feed_item_id] = true;
    }
  }

  // Merge data
  const data: FeedItemWithMeta[] = feedItems.map((item) => {
    const profile = item.profiles as unknown as { nickname: string; avatar_url: string | null } | null;
    return {
      id: item.id,
      user_id: item.user_id,
      challenge_id: item.challenge_id,
      type: item.type,
      content: item.content as Record<string, unknown>,
      created_at: item.created_at,
      nickname: profile?.nickname ?? "",
      avatar_url: profile?.avatar_url ?? null,
      like_count: likeCountMap[item.id] ?? 0,
      is_liked: isLikedMap[item.id] ?? false,
    };
  });

  return { success: true, data };
}
