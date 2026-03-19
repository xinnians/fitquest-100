export type BattleMetric = "check_ins" | "calories";
export type BattleStatus = "pending" | "active" | "completed" | "declined";

export interface Battle {
  id: string;
  challenger_id: string;
  opponent_id: string;
  challenge_id: string | null;
  metric: BattleMetric;
  start_date: string;
  end_date: string;
  status: BattleStatus;
  winner_id: string | null;
  stake_description: string | null;
  created_at: string;
}

export interface BattleWithProfiles extends Battle {
  challenger: { nickname: string; avatar_url: string | null };
  opponent: { nickname: string; avatar_url: string | null };
}
