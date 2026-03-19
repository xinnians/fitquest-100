"use client";

interface WaffleChartProps {
  /** Start date of the 100-day challenge */
  startDate: string;
  /** Set of YYYY-MM-DD strings where check-in occurred */
  checkedInDates: Set<string>;
  /** Total days in the challenge */
  totalDays?: number;
}

export function WaffleChart({
  startDate,
  checkedInDates,
  totalDays = 100,
}: WaffleChartProps) {
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cols = 10;
  const rows = Math.ceil(totalDays / cols);

  const cells = Array.from({ length: totalDays }, (_, i) => {
    const cellDate = new Date(start);
    cellDate.setDate(cellDate.getDate() + i);
    const dateStr = cellDate.toLocaleDateString("en-CA");
    const isCheckedIn = checkedInDates.has(dateStr);
    const isPast = cellDate <= today;
    const isToday = cellDate.toLocaleDateString("en-CA") === today.toLocaleDateString("en-CA");

    return { day: i + 1, dateStr, isCheckedIn, isPast, isToday };
  });

  const completedCount = cells.filter((c) => c.isCheckedIn).length;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-heading text-lg font-bold">100 天挑戰</h3>
        <span className="text-sm text-muted">
          <span className="font-bold text-accent">{completedCount}</span> / {totalDays} 天
        </span>
      </div>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {cells.map((cell) => (
          <div
            key={cell.day}
            title={`Day ${cell.day} (${cell.dateStr})`}
            className={`aspect-square rounded-sm text-[10px] flex items-center justify-center font-medium transition-colors ${
              cell.isCheckedIn
                ? "bg-accent text-white"
                : cell.isToday
                  ? "bg-primary/20 text-primary border border-primary"
                  : cell.isPast
                    ? "bg-destructive/15 text-destructive/50"
                    : "bg-border/50 text-muted/50"
            }`}
          >
            {cell.day}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-accent" /> 已打卡
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-destructive/15" /> 未打卡
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-border/50" /> 未到
        </span>
      </div>
    </div>
  );
}
