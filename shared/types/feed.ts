export type FeedType = "check_in" | "join" | "battle_start" | "battle_end";

export interface FeedItem {
  id: string;
  user_id: string;
  challenge_id: string | null;
  type: FeedType;
  content: Record<string, unknown>;
  created_at: string;
}

export interface FeedItemWithUser extends FeedItem {
  profiles: { nickname: string; avatar_url: string | null };
  like_count: number;
  is_liked: boolean;
}
