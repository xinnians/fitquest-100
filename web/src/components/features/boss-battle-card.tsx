"use client";

import Link from "next/link";
import { BossHpBar } from "./boss-hp-bar";

interface BossBattleCardProps {
  challengeId: string;
  bossName: string;
  bossEmoji: string;
  currentHp: number;
  maxHp: number;
  status: "active" | "defeated" | "expired";
  daysRemaining: number;
  hoursRemaining: number;
}

export function BossBattleCard({
  challengeId,
  bossName,
  bossEmoji,
  currentHp,
  maxHp,
  status,
  daysRemaining,
  hoursRemaining,
}: BossBattleCardProps) {
  if (status === "defeated") {
    return (
      <Link
        href={`/challenges/${challengeId}/boss`}
        className="block rounded-xl border border-accent/30 bg-accent/10 p-4 shadow-card transition-colors hover:border-accent/50"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{bossEmoji}</span>
          <div className="flex-1">
            <p className="text-sm font-bold line-through">{bossName}</p>
            <p className="mt-1 text-xs font-bold text-accent">
              🎉 Boss 已被擊敗！
            </p>
          </div>
          <span className="text-2xl">🏆</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/challenges/${challengeId}/boss`}
      className="block rounded-xl border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/50"
    >
      <div className="flex items-center gap-3">
        <span className="animate-glow-pulse text-3xl">{bossEmoji}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">{bossName}</p>
            <span className="text-xs text-muted">
              {daysRemaining > 0
                ? `${daysRemaining}天 ${hoursRemaining}小時`
                : `${hoursRemaining}小時`}
            </span>
          </div>
          <div className="mt-2">
            <BossHpBar currentHp={currentHp} maxHp={maxHp} />
          </div>
        </div>
      </div>
    </Link>
  );
}
