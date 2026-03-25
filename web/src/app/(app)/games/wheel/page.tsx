"use client";

import { useState } from "react";
import { spinWheel, claimWheelReward, getGameStatus } from "@/lib/game-actions";
import { EXERCISE_TYPES } from "shared/constants/exercise-types";
import Link from "next/link";

export default function WheelPage() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ id: string; label: string; emoji: string } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [claimResult, setClaimResult] = useState<{ xp: number; coins: number } | null>(null);
  const [error, setError] = useState("");
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);

  async function handleSpin() {
    setSpinning(true);
    setError("");

    const res = await spinWheel();
    if (res && "error" in res) {
      setError(res.error ?? "");
      setSpinning(false);
      if (res.error?.includes("已經轉過")) setAlreadyPlayed(true);
      return;
    }

    // Animate spin
    const extraSpins = 5 + Math.random() * 3;
    setRotation((prev) => prev + 360 * extraSpins);

    setTimeout(() => {
      setResult(res.exercise ?? null);
      setSpinning(false);
    }, 2500);
  }

  async function handleClaim() {
    const res = await claimWheelReward();
    if (res && "error" in res) {
      setError(res.error ?? "");
      return;
    }
    setClaimed(true);
    setClaimResult({ xp: res.reward?.xp ?? 150, coins: res.reward?.coins ?? 15 });
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <Link href="/games" className="text-sm text-muted hover:text-foreground">← 返回小遊戲</Link>

      <h1 className="mt-4 font-heading text-3xl font-extrabold">運動轉盤</h1>
      <p className="mt-1 text-sm text-muted">
        轉一轉看看今天的加碼運動，完成後可獲得額外獎勵！
      </p>

      {/* Wheel */}
      <div className="mt-8 flex justify-center">
        <div
          className="flex h-56 w-56 items-center justify-center rounded-full border-4 border-primary bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg transition-transform dark:from-orange-950 dark:to-yellow-950"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 2.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
          }}
        >
          <div className="grid grid-cols-3 gap-1 p-4">
            {EXERCISE_TYPES.slice(0, 9).map((ex) => (
              <div key={ex.id} className="flex h-12 w-12 items-center justify-center rounded-lg text-xl">
                {ex.emoji}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      {result && !claimed && (
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5 text-center animate-fade-in-up">
          <p className="text-4xl">{result.emoji}</p>
          <p className="mt-2 font-heading text-xl font-bold">{result.label}</p>
          <p className="mt-1 text-sm text-muted">
            今天完成一次「{result.label}」打卡即可領取獎勵
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href="/check-in"
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white"
            >
              去打卡
            </Link>
            <button
              onClick={handleClaim}
              className="flex-1 rounded-xl border border-accent bg-accent/10 px-4 py-2.5 text-sm font-bold text-accent"
            >
              領取獎勵
            </button>
          </div>
        </div>
      )}

      {claimed && claimResult && (
        <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-5 text-center animate-fade-in-up">
          <p className="text-4xl">🎉</p>
          <p className="mt-2 font-heading text-xl font-bold text-accent">獎勵已領取！</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
              +{claimResult.xp} XP
            </span>
            <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-bold text-yellow-600 dark:text-yellow-400">
              +{claimResult.coins} 🪙
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      {!result && !alreadyPlayed && (
        <button
          onClick={handleSpin}
          disabled={spinning}
          className="mt-8 w-full rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-4 text-lg font-bold text-white shadow-glow-primary transition-all disabled:opacity-50"
        >
          {spinning ? "轉動中..." : "開始轉盤 🎰"}
        </button>
      )}

      {alreadyPlayed && (
        <div className="mt-6 text-center text-sm text-muted">
          今天已經轉過了，明天再來吧！
        </div>
      )}
    </main>
  );
}
