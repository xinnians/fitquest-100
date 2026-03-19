"use client";

interface CalorieGaugeProps {
  consumed: number;
  burned: number;
  goal: number;
}

export function CalorieGauge({ consumed, burned, goal }: CalorieGaugeProps) {
  const net = consumed - burned;
  const remaining = goal - net;
  const progress = Math.min((net / goal) * 100, 100);

  // SVG circle parameters
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
      {/* Ring */}
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={
              remaining >= 0 ? "var(--color-accent)" : "var(--color-destructive)"
            }
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-black">
            {remaining >= 0 ? remaining : 0}
          </span>
          <span className="text-xs text-muted">剩餘 kcal</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-info" />
          <span className="text-muted">目標</span>
          <span className="ml-auto font-bold">{goal}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-muted">攝取</span>
          <span className="ml-auto font-bold">{consumed}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-accent" />
          <span className="text-muted">消耗</span>
          <span className="ml-auto font-bold">-{burned}</span>
        </div>
      </div>
    </div>
  );
}
