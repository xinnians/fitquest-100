"use client";

import { useState } from "react";
import Link from "next/link";
import { BossHpBar } from "@/components/features/boss-hp-bar";
import { BossDamageList } from "@/components/features/boss-damage-list";
import { BossDefeatedOverlay } from "@/components/features/boss-defeated-overlay";
import type { BossDamageContribution } from "shared/types/boss-battle";

interface BossData {
  id: string;
  boss_name: string;
  boss_emoji: string;
  boss_description: string | null;
  boss_color: string | null;
  max_hp: number;
  current_hp: number;
  status: "active" | "defeated" | "expired";
  week_start: string;
  week_end: string;
  contributions: BossDamageContribution[];
  total_damage_dealt: number;
  days_remaining: number;
  hours_remaining: number;
}

interface HistoryEntry {
  id: string;
  boss_name: string;
  boss_emoji: string;
  max_hp: number;
  current_hp: number;
  status: string;
  week_start: string;
  week_end: string;
}

interface BossClientProps {
  challengeId: string;
  boss: BossData;
  history: HistoryEntry[];
  currentUserId: string | null;
}

export function BossClient({
  challengeId,
  boss,
  history,
  currentUserId,
}: BossClientProps) {
  const [showOverlay, setShowOverlay] = useState(boss.status === "defeated");

  const myContribution = boss.contributions.find(
    (c) => c.user_id === currentUserId
  );

  return (
    <div>
      {/* Back link */}
      <Link
        href={`/challenges/${challengeId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-primary"
      >
        <span>&#8592;</span> 返回挑戰
      </Link>

      {/* Boss Header */}
      <div className="mb-6 text-center">
        <div className="mb-3 text-6xl animate-glow-pulse">{boss.boss_emoji}</div>
        <h1 className="font-heading text-2xl font-extrabold">{boss.boss_name}</h1>
        {boss.boss_description && (
          <p className="mt-2 text-sm text-muted">{boss.boss_description}</p>
        )}
        {boss.status === "active" && (
          <p className="mt-2 text-xs text-muted">
            距離結算還有{" "}
            <span className="font-bold text-primary">
              {boss.days_remaining > 0
                ? `${boss.days_remaining}天 ${boss.hours_remaining}小時`
                : `${boss.hours_remaining}小時`}
            </span>
          </p>
        )}
        {boss.status === "defeated" && (
          <p className="mt-2 text-sm font-bold text-accent">🎉 已被擊敗！</p>
        )}
        {boss.status === "expired" && (
          <p className="mt-2 text-sm text-muted">Boss 逃走了...</p>
        )}
      </div>

      {/* HP Bar */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <BossHpBar currentHp={boss.current_hp} maxHp={boss.max_hp} />
        <p className="mt-2 text-center text-xs text-muted">
          團隊已造成 <span className="font-bold text-destructive">{boss.total_damage_dealt.toLocaleString()}</span> 傷害
        </p>
      </section>

      {/* My Contribution */}
      {myContribution && (
        <section className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-center text-sm">
            你的貢獻：
            <span className="ml-1 font-heading text-xl font-extrabold text-primary">
              {myContribution.total_damage.toLocaleString()}
            </span>
            <span className="ml-1 text-xs text-muted">卡路里傷害</span>
          </p>
        </section>
      )}

      {/* Team Damage Contributions */}
      <section className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="mb-4 font-heading text-lg font-bold">團隊貢獻</h3>
        <BossDamageList
          contributions={boss.contributions}
          currentUserId={currentUserId}
        />
      </section>

      {/* Battle History */}
      {history.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-3 font-heading text-lg font-bold">歷史戰績</h3>
          <div className="space-y-2">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-card"
              >
                <span className="text-2xl">{h.boss_emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{h.boss_name}</p>
                  <p className="text-xs text-muted">
                    {h.week_start} ~ {h.week_end}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold ${
                    h.status === "defeated" ? "text-accent" : "text-muted"
                  }`}
                >
                  {h.status === "defeated" ? "🏆 擊敗" : "逃走了"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Defeated Overlay */}
      {showOverlay && (
        <BossDefeatedOverlay
          bossName={boss.boss_name}
          bossEmoji={boss.boss_emoji}
          onClose={() => setShowOverlay(false)}
        />
      )}
    </div>
  );
}
