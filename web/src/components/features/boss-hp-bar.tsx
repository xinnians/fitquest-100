"use client";

interface BossHpBarProps {
  currentHp: number;
  maxHp: number;
  animated?: boolean;
}

export function BossHpBar({ currentHp, maxHp, animated = true }: BossHpBarProps) {
  const pct = maxHp > 0 ? (currentHp / maxHp) * 100 : 0;

  // Color transitions: green > 60%, orange 30-60%, red < 30%
  const barColor =
    pct > 60
      ? "bg-accent"
      : pct > 30
        ? "bg-primary"
        : "bg-destructive";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-muted">HP</span>
        <span className="font-bold">
          {currentHp.toLocaleString()} / {maxHp.toLocaleString()}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full ${barColor} ${animated ? "transition-all duration-700 ease-out" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
