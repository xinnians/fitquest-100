"use client";

import Link from "next/link";

interface CheckInSuccessProps {
  calories: number;
  onClose: () => void;
}

export function CheckInSuccess({ calories, onClose }: CheckInSuccessProps) {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div
          className="text-7xl animate-glow-pulse"
          style={{
            animation: "glow-pulse 2s ease-in-out infinite, fade-in-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
          }}
        >
          🔥
        </div>
        <h1 className="mt-4 font-heading text-3xl font-black text-accent animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          打卡成功！
        </h1>
        <p className="mt-2 text-muted animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          太棒了，今天也堅持了！
        </p>
        <div className="mt-6 glass-card border-accent/20 px-8 py-4 shadow-glow-accent/30 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
          <p className="text-sm text-muted">消耗了</p>
          <p className="font-heading text-4xl font-black text-accent">
            {calories}
            <span className="ml-1 text-base font-normal text-muted">kcal</span>
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
          <Link
            href="/dashboard"
            className="btn-press rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 font-bold text-white shadow-glow-primary transition-all"
          >
            查看 Dashboard
          </Link>
          <button
            onClick={onClose}
            className="btn-press rounded-xl glass-card px-6 py-3 font-medium transition-all hover:bg-white/8"
          >
            繼續打卡
          </button>
        </div>
      </div>
    </main>
  );
}
