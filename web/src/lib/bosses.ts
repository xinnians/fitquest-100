import type { BossDefinition } from "shared/types/boss-battle";

export const BOSSES: BossDefinition[] = [
  {
    id: "sloth-king",
    name: "懶惰魔王",
    emoji: "🦥",
    description: "沙發上的霸主，最愛說「明天再運動」。打敗他，證明你不是懶骨頭！",
    color: "#8B7355",
  },
  {
    id: "sugar-beast",
    name: "甜食巨獸",
    emoji: "🍰",
    description: "用蛋糕和珍奶誘惑你的怪獸，每一口都讓你的熱量爆表！",
    color: "#FF69B4",
  },
  {
    id: "midnight-ghost",
    name: "熬夜幽靈",
    emoji: "👻",
    description: "深夜滑手機的幽靈，偷走你的睡眠和隔天的運動動力。",
    color: "#6B5B95",
  },
  {
    id: "couch-dragon",
    name: "沙發巨龍",
    emoji: "🐉",
    description: "盤踞在沙發上的巨龍，用追劇的火焰燒毀你的運動計劃。",
    color: "#CD5C5C",
  },
  {
    id: "junk-food-goblin",
    name: "垃圾食物哥布林",
    emoji: "👹",
    description: "深夜出沒的小惡魔，專門在你餓的時候遞上洋芋片和泡麵。",
    color: "#DAA520",
  },
  {
    id: "excuse-wizard",
    name: "藉口法師",
    emoji: "🧙",
    description: "「今天太累了」「天氣不好」「明天補回來」—— 他的咒語永遠有效。",
    color: "#4682B4",
  },
  {
    id: "elevator-golem",
    name: "電梯石像",
    emoji: "🗿",
    description: "守在電梯旁的石像怪，阻止你走樓梯的每一次嘗試。",
    color: "#808080",
  },
  {
    id: "snooze-demon",
    name: "貪睡惡魔",
    emoji: "😈",
    description: "每天早上按掉你鬧鐘的惡魔，讓你的晨跑計劃永遠是夢。",
    color: "#9370DB",
  },
  {
    id: "stress-hydra",
    name: "壓力九頭蛇",
    emoji: "🐍",
    description: "工作壓力化身的九頭蛇，砍掉一個頭還會長出兩個。運動是唯一的解藥！",
    color: "#2E8B57",
  },
  {
    id: "binge-kraken",
    name: "暴食海怪",
    emoji: "🦑",
    description: "深海中的暴食怪獸，用無底的胃口拖你進大吃大喝的漩渦。",
    color: "#4169E1",
  },
];

/**
 * Deterministically select a boss for a given week.
 * Uses a simple hash of the week start date to pick a boss,
 * ensuring the same week always gets the same boss.
 */
export function getBossForWeek(weekStart: Date): BossDefinition {
  const dateStr = weekStart.toISOString().split("T")[0];
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % BOSSES.length;
  return BOSSES[index];
}

export function getBossById(id: string): BossDefinition | undefined {
  return BOSSES.find((b) => b.id === id);
}
