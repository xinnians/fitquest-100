"use client";

import type { BossDamageContribution } from "shared/types/boss-battle";

interface BossDamageListProps {
  contributions: BossDamageContribution[];
  currentUserId?: string | null;
}

export function BossDamageList({ contributions, currentUserId }: BossDamageListProps) {
  const maxDamage = contributions[0]?.total_damage ?? 1;

  return (
    <div className="space-y-3">
      {contributions.map((c, i) => {
        const pct = maxDamage > 0 ? (c.total_damage / maxDamage) * 100 : 0;
        const isCurrentUser = c.user_id === currentUserId;

        return (
          <div
            key={c.user_id}
            className={`flex items-center gap-3 ${isCurrentUser ? "rounded-lg bg-primary/5 p-2 -mx-2" : ""}`}
          >
            <span className="w-6 text-center text-sm font-bold text-muted">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
            </span>
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className={`text-sm font-medium ${isCurrentUser ? "text-primary" : ""}`}>
                  {c.nickname}
                  {isCurrentUser && <span className="ml-1 text-xs text-muted">（你）</span>}
                </span>
                <span className="text-sm font-bold text-destructive">
                  {c.total_damage.toLocaleString()}
                  <span className="ml-1 text-xs font-normal text-muted">傷害</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-destructive/70 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
      {contributions.length === 0 && (
        <p className="py-4 text-center text-sm text-muted">
          還沒有人造成傷害，快去打卡吧！
        </p>
      )}
    </div>
  );
}
