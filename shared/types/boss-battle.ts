export interface BossDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

export interface BossBattle {
  id: string;
  challenge_id: string;
  boss_name: string;
  boss_emoji: string;
  boss_description: string | null;
  boss_color: string | null;
  max_hp: number;
  current_hp: number;
  week_start: string;
  week_end: string;
  status: "active" | "defeated" | "expired";
  defeated_at: string | null;
  rewards_distributed: boolean;
  created_at: string;
}

export interface BossDamageLog {
  id: string;
  boss_battle_id: string;
  user_id: string;
  check_in_id: string;
  damage: number;
  dealt_at: string;
}

export interface BossDamageContribution {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  total_damage: number;
}

export interface BossBattleWithDamage extends BossBattle {
  contributions: BossDamageContribution[];
  total_damage_dealt: number;
}
