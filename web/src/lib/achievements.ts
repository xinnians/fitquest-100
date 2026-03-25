import type { Achievement } from "shared/types/achievement";

/**
 * 靜態成就目錄（如 characters/bosses 模式，不存 DB）
 */
export const ACHIEVEMENTS: Achievement[] = [
  // === Streak 連續打卡 ===
  { id: "streak_7", name: "初心者", description: "連續打卡 7 天", emoji: "🔥", category: "streak", rarity: "common", xpReward: 500, coinReward: 50 },
  { id: "streak_14", name: "堅持者", description: "連續打卡 14 天", emoji: "🔥", category: "streak", rarity: "rare", xpReward: 1000, coinReward: 100 },
  { id: "streak_30", name: "鐵人", description: "連續打卡 30 天", emoji: "💪", category: "streak", rarity: "epic", xpReward: 2000, coinReward: 200 },
  { id: "streak_50", name: "超人", description: "連續打卡 50 天", emoji: "⚡", category: "streak", rarity: "epic", xpReward: 3000, coinReward: 300 },
  { id: "streak_100", name: "傳說勇者", description: "連續打卡 100 天", emoji: "👑", category: "streak", rarity: "legendary", xpReward: 10000, coinReward: 1000 },

  // === Exercise 運動多樣性 ===
  { id: "exercise_3", name: "多元嘗試", description: "嘗試 3 種不同運動", emoji: "🏃", category: "exercise", rarity: "common", xpReward: 300, coinReward: 30 },
  { id: "exercise_5", name: "運動達人", description: "嘗試 5 種不同運動", emoji: "🏋️", category: "exercise", rarity: "rare", xpReward: 800, coinReward: 80 },
  { id: "exercise_10", name: "全能選手", description: "嘗試 10 種不同運動", emoji: "🏅", category: "exercise", rarity: "epic", xpReward: 2000, coinReward: 200 },

  // === Social 社交 ===
  { id: "first_challenge", name: "結伴同行", description: "加入第一個挑戰", emoji: "🤝", category: "social", rarity: "common", xpReward: 200, coinReward: 20 },
  { id: "pk_first_win", name: "初戰告捷", description: "贏得第一場 PK", emoji: "⚔️", category: "social", rarity: "common", xpReward: 500, coinReward: 50 },
  { id: "pk_5_wins", name: "PK 高手", description: "累計贏得 5 場 PK", emoji: "🏆", category: "social", rarity: "rare", xpReward: 1500, coinReward: 150 },
  { id: "pk_10_wins", name: "PK 王者", description: "累計贏得 10 場 PK", emoji: "👑", category: "social", rarity: "epic", xpReward: 3000, coinReward: 300 },

  // === Calories 卡路里 ===
  { id: "cal_10k", name: "燃脂新手", description: "累計消耗 10,000 kcal", emoji: "🔥", category: "calories", rarity: "common", xpReward: 500, coinReward: 50 },
  { id: "cal_50k", name: "燃脂達人", description: "累計消耗 50,000 kcal", emoji: "💥", category: "calories", rarity: "rare", xpReward: 2000, coinReward: 200 },
  { id: "cal_100k", name: "燃脂傳說", description: "累計消耗 100,000 kcal", emoji: "🌋", category: "calories", rarity: "epic", xpReward: 5000, coinReward: 500 },

  // === Boss 戰 ===
  { id: "boss_1", name: "勇敢挑戰", description: "擊敗第一隻 Boss", emoji: "👹", category: "boss", rarity: "common", xpReward: 500, coinReward: 50 },
  { id: "boss_5", name: "Boss 獵人", description: "累計擊敗 5 隻 Boss", emoji: "🐉", category: "boss", rarity: "rare", xpReward: 2000, coinReward: 200 },
  { id: "boss_10", name: "Boss 終結者", description: "累計擊敗 10 隻 Boss", emoji: "⚡", category: "boss", rarity: "epic", xpReward: 5000, coinReward: 500 },
];

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

const RARITY_ORDER = { common: 0, rare: 1, epic: 2, legendary: 3 };

export function getAchievementsByCategory(category: Achievement["category"]): Achievement[] {
  return ACHIEVEMENTS
    .filter((a) => a.category === category)
    .sort((a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]);
}
