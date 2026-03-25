"use client";

import { useState, useTransition } from "react";
import type { LeaderboardRange } from "shared/types/challenge";

interface LeaderboardEntry {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  total_check_ins: number;
  total_calories: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  metric?: "check_ins" | "calories";
  onRangeChange?: (range: LeaderboardRange) => Promise<LeaderboardEntry[]>;
  showRangeTabs?: boolean;
}

const RANGE_LABELS: Record<LeaderboardRange, string> = {
  daily: "今日",
  weekly: "本週",
  total: "總計",
};

export function Leaderboard({
  entries: initialEntries,
  metric = "check_ins",
  onRangeChange,
  showRangeTabs = false,
}: LeaderboardProps) {
  const [activeRange, setActiveRange] = useState<LeaderboardRange>("total");
  const [entries, setEntries] = useState(initialEntries);
  const [isPending, startTransition] = useTransition();

  function handleRangeChange(range: LeaderboardRange) {
    if (range === activeRange) return;
    setActiveRange(range);

    if (onRangeChange) {
      startTransition(async () => {
        const newEntries = await onRangeChange(range);
        setEntries(newEntries);
      });
    }
  }

  const sorted = [...entries].sort((a, b) =>
    metric === "check_ins"
      ? b.total_check_ins - a.total_check_ins
      : b.total_calories - a.total_calories
  );

  const maxValue = sorted[0]
    ? metric === "check_ins"
      ? sorted[0].total_check_ins
      : sorted[0].total_calories
    : 1;

  return (
    <div>
      {/* Range Tabs */}
      {showRangeTabs && (
        <div className="mb-4 flex gap-1 rounded-xl bg-border/50 p-1">
          {(Object.keys(RANGE_LABELS) as LeaderboardRange[]).map((range) => (
            <button
              key={range}
              onClick={() => handleRangeChange(range)}
              disabled={isPending}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeRange === range
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {RANGE_LABELS[range]}
            </button>
          ))}
        </div>
      )}

      {/* Leaderboard Entries */}
      <div className={`space-y-3 ${isPending ? "opacity-50" : ""}`}>
        {sorted.map((entry, i) => {
          const value =
            metric === "check_ins" ? entry.total_check_ins : entry.total_calories;
          const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <div key={entry.user_id} className="flex items-center gap-3">
              <span className="w-6 text-center text-sm font-bold text-muted">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
              </span>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">{entry.nickname}</span>
                  <span className="text-sm font-bold text-primary">
                    {value}
                    <span className="ml-1 text-xs font-normal text-muted">
                      {metric === "check_ins" ? "天" : "kcal"}
                    </span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="py-4 text-center text-sm text-muted">尚無數據</p>
        )}
      </div>
    </div>
  );
}
