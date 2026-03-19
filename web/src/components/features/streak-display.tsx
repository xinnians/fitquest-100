"use client";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <span className="text-3xl">{currentStreak > 0 ? "🔥" : "💤"}</span>
        <div>
          <p className="font-heading text-2xl font-black text-foreground">
            {currentStreak}
          </p>
          <p className="text-xs text-muted">連續天數</p>
        </div>
      </div>
      <div className="h-8 w-px bg-border" />
      <div>
        <p className="font-heading text-2xl font-black text-foreground">
          {longestStreak}
        </p>
        <p className="text-xs text-muted">最長紀錄</p>
      </div>
    </div>
  );
}
