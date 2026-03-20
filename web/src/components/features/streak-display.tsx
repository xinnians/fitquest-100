"use client";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  totalDays?: number;
}

export function StreakDisplay({ currentStreak, longestStreak, totalDays }: StreakDisplayProps) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <span
          className={`text-4xl ${currentStreak > 0 ? "animate-glow-pulse" : ""}`}
        >
          {currentStreak > 0 ? "🔥" : "💤"}
        </span>
        <div>
          <p className="font-heading text-3xl font-black text-primary">
            {currentStreak}
          </p>
          <p className="text-sm text-muted">天連續打卡</p>
        </div>
      </div>
      <div className="mt-4 flex gap-6 border-t border-white/5 pt-4">
        <div>
          <p className="font-heading text-lg font-bold">{longestStreak}</p>
          <p className="text-xs text-muted">最長紀錄</p>
        </div>
        {totalDays !== undefined && (
          <div>
            <p className="font-heading text-lg font-bold">{totalDays}</p>
            <p className="text-xs text-muted">總打卡天數</p>
          </div>
        )}
      </div>
    </div>
  );
}
