export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: "streak" | "exercise" | "social" | "calories" | "boss";
  rarity: "common" | "rare" | "epic" | "legendary";
  xpReward: number;
  coinReward: number;
}

export interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}
