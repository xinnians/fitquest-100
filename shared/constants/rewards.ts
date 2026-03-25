/**
 * XP & 金幣獎勵數值 + 等級系統
 */

// === 行動獎勵 ===
export const REWARDS = {
  CHECK_IN: { xp: 100, coins: 10 },
  MEAL_LOG: { xp: 30, coins: 3 },
  PK_WIN: { xp: 300, coins: 30 },
  BOSS_DEFEAT: { xp: 500, coins: 50 },
  STREAK_7: { xp: 500, coins: 50 },
  STREAK_30: { xp: 2000, coins: 200 },
} as const;

// === Streak 加成 ===
export const STREAK_MULTIPLIERS = [
  { days: 30, multiplier: 2.0 },
  { days: 7, multiplier: 1.5 },
] as const;

export function getStreakMultiplier(streakDays: number): number {
  for (const tier of STREAK_MULTIPLIERS) {
    if (streakDays >= tier.days) return tier.multiplier;
  }
  return 1.0;
}

// === 等級系統 ===
// 每級所需 XP: base * 1.6^(level-1)，起始 500
const LEVEL_BASE_XP = 500;
const LEVEL_GROWTH = 1.6;
export const MAX_LEVEL = 50;

/**
 * 計算升到指定等級所需的累計 XP
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.round(LEVEL_BASE_XP * Math.pow(LEVEL_GROWTH, i - 1));
  }
  return total;
}

/**
 * 計算目前等級的 XP 進度 (0~1)
 */
export function xpProgress(xp: number, level: number): number {
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const needed = nextLevelXp - currentLevelXp;
  if (needed <= 0) return 1;
  return Math.min((xp - currentLevelXp) / needed, 1);
}

/**
 * 根據累計 XP 計算等級
 */
export function calculateLevel(totalXp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && totalXp >= xpForLevel(level + 1)) {
    level++;
  }
  return level;
}

/**
 * 等級解鎖內容
 */
export const LEVEL_UNLOCKS: Record<number, string> = {
  2: "第一套裝備",
  3: "PK 對戰功能",
  4: "Boss 戰參與",
  5: "稀有裝備商店",
  10: "更多造型",
  20: "傳說級徽章",
};
