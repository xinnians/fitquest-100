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
        <div className="text-7xl animate-bounce">🔥</div>
        <h1 className="mt-4 font-heading text-3xl font-black text-accent">
          打卡成功！
        </h1>
        <p className="mt-2 text-muted">太棒了，今天也堅持了！</p>
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 px-8 py-4">
          <p className="text-sm text-muted">消耗了</p>
          <p className="font-heading text-4xl font-black text-accent">
            {calories}
            <span className="ml-1 text-base font-normal text-muted">kcal</span>
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-card transition-colors hover:bg-primary-hover"
          >
            查看 Dashboard
          </Link>
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-6 py-3 font-medium transition-colors hover:bg-card"
          >
            繼續打卡
          </button>
        </div>
      </div>
    </main>
  );
}
