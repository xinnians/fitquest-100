"use client";

import { xpProgress, xpForLevel, LEVEL_UNLOCKS } from "shared/constants/rewards";

interface XpBarProps {
  xp: number;
  level: number;
  coins: number;
}

export function XpBar({ xp, level, coins }: XpBarProps) {
  const progress = xpProgress(xp, level);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const xpInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const nextUnlock = Object.entries(LEVEL_UNLOCKS).find(([l]) => Number(l) > level);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
            {level}
          </span>
          <div>
            <p className="text-xs font-medium text-muted">等級 {level}</p>
            <p className="text-[10px] text-muted/70">
              {xpInLevel} / {xpNeeded} XP
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm">🪙</span>
          <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{coins}</span>
        </div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/20">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      {nextUnlock && (
        <p className="mt-1 text-[10px] text-muted/70">
          Lv.{nextUnlock[0]} 解鎖：{nextUnlock[1]}
        </p>
      )}
    </div>
  );
}
