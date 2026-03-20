"use client";

interface CalorieGaugeProps {
  consumed: number;
  burned: number;
  goal: number;
}

export function CalorieGauge({ consumed, burned, goal }: CalorieGaugeProps) {
  const net = consumed - burned;
  const remaining = Math.max(goal - net, 0);
  const progress = Math.min((net / goal) * 100, 100);

  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-accent)" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={remaining > 0 ? "url(#gaugeGradient)" : "var(--color-destructive)"}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-3xl font-black text-accent">
            {remaining}
          </span>
          <span className="text-xs text-muted">剩餘 kcal</span>
        </div>
      </div>

      <div className="mt-4 flex gap-6">
        <div className="text-center">
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm font-bold">{consumed}</span>
          <div className="text-xs text-muted">已攝取</div>
        </div>
        <div className="text-center">
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-accent" />
          <span className="text-sm font-bold">{burned}</span>
          <div className="text-xs text-muted">已消耗</div>
        </div>
        <div className="text-center">
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-info" />
          <span className="text-sm font-bold">{goal}</span>
          <div className="text-xs text-muted">目標</div>
        </div>
      </div>
    </div>
  );
}
