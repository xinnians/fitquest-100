"use client";

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
}

export function Leaderboard({ entries, metric = "check_ins" }: LeaderboardProps) {
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
    <div className="space-y-3">
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
  );
}
