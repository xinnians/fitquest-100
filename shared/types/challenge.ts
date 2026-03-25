export interface Challenge {
  id: string;
  name: string;
  invite_code: string;
  creator_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface ChallengeMember {
  challenge_id: string;
  user_id: string;
  joined_at: string;
}

export interface ChallengeWithMembers extends Challenge {
  members: (ChallengeMember & {
    profiles: { nickname: string; avatar_url: string | null };
  })[];
}

export interface LeaderboardEntry {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  total_check_ins: number;
  total_calories: number;
}

export type LeaderboardRange = "daily" | "weekly" | "total";
