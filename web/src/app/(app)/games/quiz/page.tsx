"use client";

import { useState, useEffect } from "react";
import { getQuizQuestion, submitQuizAnswer } from "@/lib/game-actions";
import Link from "next/link";

interface QuizQuestion {
  food: { name: string; emoji: string; serving: string };
  foodIndex: number;
}

const GRADE_TEXT = {
  perfect: { label: "超精準！", emoji: "🎯", color: "text-accent" },
  good: { label: "不錯！", emoji: "👍", color: "text-primary" },
  ok: { label: "再接再厲", emoji: "💪", color: "text-muted" },
};

export default function QuizPage() {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [guess, setGuess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    actual: number;
    guessed: number;
    accuracy: number;
    grade: "perfect" | "good" | "ok";
    reward: { xp: number; coins: number };
  } | null>(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getQuizQuestion();
      if (!data) return;
      if ("played" in data && data.played) {
        setAlreadyPlayed(true);
      } else if ("food" in data) {
        setQuestion({ food: data.food as QuizQuestion["food"], foodIndex: data.foodIndex as number });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit() {
    if (!question || !guess) return;
    setError("");

    const res = await submitQuizAnswer(question.foodIndex, parseInt(guess, 10));
    if (res && "error" in res) {
      setError(res.error ?? "");
      return;
    }

    setSubmitted(true);
    setResult({
      actual: res.actual!,
      guessed: res.guessed!,
      accuracy: res.accuracy!,
      grade: res.grade!,
      reward: { xp: res.reward?.xp ?? 0, coins: res.reward?.coins ?? 0 },
    });
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-4 pb-8 pt-8">
        <p className="text-center text-muted">載入中...</p>
      </main>
    );
  }

  if (alreadyPlayed) {
    return (
      <main className="mx-auto max-w-md px-4 pb-8 pt-8">
        <Link href="/games" className="text-sm text-muted hover:text-foreground">← 返回小遊戲</Link>
        <div className="mt-12 text-center">
          <p className="text-4xl">🍔</p>
          <p className="mt-3 font-heading text-xl font-bold">今天已經玩過了</p>
          <p className="mt-1 text-sm text-muted">明天再來挑戰吧！</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <Link href="/games" className="text-sm text-muted hover:text-foreground">← 返回小遊戲</Link>

      <h1 className="mt-4 font-heading text-3xl font-extrabold">猜猜熱量</h1>
      <p className="mt-1 text-sm text-muted">猜猜這個食物有多少卡路里？</p>

      {question && !submitted && (
        <div className="mt-8 animate-fade-in-up">
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
            <p className="text-6xl">{question.food.emoji}</p>
            <p className="mt-4 font-heading text-2xl font-bold">{question.food.name}</p>
            <p className="mt-1 text-sm text-muted">份量：{question.food.serving}</p>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-muted">
              你猜多少 kcal？
            </label>
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center text-2xl font-bold outline-none focus:border-primary"
              placeholder="輸入數字"
              min="0"
              max="2000"
            />
          </div>

          {error && (
            <p className="mt-2 text-center text-sm text-destructive">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!guess || parseInt(guess, 10) <= 0}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-4 text-lg font-bold text-white shadow-glow-primary transition-all disabled:opacity-50"
          >
            送出答案
          </button>
        </div>
      )}

      {submitted && result && (
        <div className="mt-8 animate-fade-in-up">
          <div className="rounded-xl border border-border bg-card p-6 text-center shadow-card">
            <p className="text-4xl">{GRADE_TEXT[result.grade].emoji}</p>
            <p className={`mt-2 font-heading text-2xl font-bold ${GRADE_TEXT[result.grade].color}`}>
              {GRADE_TEXT[result.grade].label}
            </p>

            <div className="mt-4 flex items-center justify-center gap-8">
              <div>
                <p className="text-xs text-muted">你猜的</p>
                <p className="font-heading text-2xl font-bold">{result.guessed}</p>
              </div>
              <div className="text-2xl text-muted">vs</div>
              <div>
                <p className="text-xs text-muted">正確答案</p>
                <p className="font-heading text-2xl font-bold text-accent">{result.actual}</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-muted">
              準確度：{result.accuracy}%
            </p>

            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                +{result.reward.xp} XP
              </span>
              <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-bold text-yellow-600 dark:text-yellow-400">
                +{result.reward.coins} 🪙
              </span>
            </div>
          </div>

          <Link
            href="/games"
            className="mt-4 block text-center text-sm text-muted hover:text-foreground"
          >
            返回小遊戲
          </Link>
        </div>
      )}
    </main>
  );
}
