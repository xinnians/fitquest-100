"use client";

interface BossDefeatedOverlayProps {
  bossName: string;
  bossEmoji: string;
  onClose: () => void;
}

export function BossDefeatedOverlay({
  bossName,
  bossEmoji,
  onClose,
}: BossDefeatedOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm animate-fade-in-up rounded-2xl border border-accent/30 bg-card p-8 text-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 text-6xl animate-glow-pulse">{bossEmoji}</div>
        <h2 className="font-heading text-2xl font-extrabold text-accent">
          BOSS 已被擊敗！
        </h2>
        <p className="mt-2 text-sm text-muted">
          <span className="line-through">{bossName}</span> 被團隊合力打倒了！
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <div className="rounded-xl border border-border bg-background px-4 py-3 text-center">
            <p className="font-heading text-lg font-extrabold text-primary">+500</p>
            <p className="text-xs text-muted">XP（即將推出）</p>
          </div>
          <div className="rounded-xl border border-border bg-background px-4 py-3 text-center">
            <p className="font-heading text-lg font-extrabold text-primary">+50</p>
            <p className="text-xs text-muted">金幣（即將推出）</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-accent/90"
        >
          太棒了！
        </button>
      </div>
    </div>
  );
}
