"use client";

interface WaffleChartProps {
  startDate: string;
  checkedInDates: Set<string>;
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
          <span className="font-bold text-primary">{completedCount}</span> / {totalDays} 天
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
            className={`aspect-square rounded-md text-[10px] flex items-center justify-center font-medium transition-all ${
              cell.isCheckedIn
                ? "bg-primary/30 border border-primary/40 text-primary"
                : cell.isToday
                  ? "bg-accent/20 border border-accent/30 text-accent"
                  : cell.isPast
                    ? "bg-white/[0.02] border border-white/[0.04] text-muted/40"
                    : "bg-white/[0.02] border border-white/[0.04] text-muted/30"
            }`}
          >
            {cell.day}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary/30 border border-primary/40" /> 已打卡
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-accent/20 border border-accent/30" /> 今天
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-white/[0.02] border border-white/[0.04]" /> 未到
        </span>
      </div>
    </div>
  );
}
