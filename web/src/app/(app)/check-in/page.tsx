"use client";

import { useState, useActionState } from "react";
import { createCheckIn } from "@/lib/check-in-actions";
import { EXERCISE_TYPES } from "shared/constants/exercise-types";
import { calculateCaloriesBurned } from "shared/utils/calories";
import { CheckInSuccess } from "@/components/features/check-in-success";

export default function CheckInPage() {
  const [selectedType, setSelectedType] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastCalories, setLastCalories] = useState(0);
  const [lastReward, setLastReward] = useState<{
    xp: number; coins: number; leveledUp: boolean; newLevel: number;
  } | null>(null);

  const estimatedCalories =
    selectedType && duration
      ? calculateCaloriesBurned(selectedType, 70, parseInt(duration, 10) || 0)
      : 0;

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await createCheckIn(formData);
      if (result && "success" in result) {
        setLastCalories(result.data?.calories_burned ?? estimatedCalories);
        setLastReward(result.reward ?? null);
        setShowSuccess(true);
        setSelectedType("");
        setDuration("");
        setNotes("");
        return null;
      }
      return result ?? null;
    },
    null
  );

  if (showSuccess) {
    return (
      <CheckInSuccess
        calories={lastCalories}
        reward={lastReward}
        onClose={() => setShowSuccess(false)}
      />
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="font-heading text-3xl font-extrabold animate-fade-in-up">運動打卡</h1>
      <p className="mt-1 text-muted animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        最低 15 分鐘 = 1 次有效打卡
      </p>

      <form action={formAction} className="mt-6 space-y-6">
        {/* Exercise Type Grid */}
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <label className="mb-3 block text-sm font-semibold text-muted">選擇運動類型</label>
          <div className="grid grid-cols-3 gap-2">
            {EXERCISE_TYPES.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => setSelectedType(exercise.id)}
                className={`btn-press flex flex-col items-center gap-1 rounded-xl px-3 py-3 text-sm transition-all ${
                  selectedType === exercise.id
                    ? "glass-card-elevated border-primary/40 text-primary shadow-glow-primary/30"
                    : "glass-card text-foreground hover:border-white/12"
                }`}
              >
                <span className="text-2xl">{exercise.emoji}</span>
                <span className="font-medium">{exercise.label}</span>
              </button>
            ))}
          </div>
          <input type="hidden" name="exercise_type" value={selectedType} />
        </div>

        {/* Duration */}
        <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <label className="mb-2 block text-sm font-semibold text-muted">運動時長（分鐘）</label>
          <div className="flex gap-2">
            {["15", "30", "45", "60", "90"].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setDuration(val)}
                className={`btn-press rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  duration === val
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-glow-primary/30"
                    : "glass-card text-foreground hover:border-white/12"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
          <input
            type="number"
            name="duration_minutes"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-2 w-full rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/60 focus:shadow-[0_0_12px_rgba(251,146,60,0.15)]"
            placeholder="或直接輸入分鐘數"
            min="1"
            max="480"
            required
          />
        </div>

        {/* Calorie Estimate */}
        {estimatedCalories > 0 && (
          <div className="glass-card p-4 text-center border-accent/20 shadow-glow-accent/20 animate-fade-in-up">
            <p className="text-sm text-muted">預估消耗</p>
            <p className="font-heading text-3xl font-black text-accent">
              {estimatedCalories}
              <span className="ml-1 text-base font-normal text-muted">kcal</span>
            </p>
          </div>
        )}

        {/* Notes */}
        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <label className="mb-2 block text-sm font-semibold text-muted">備註（選填）</label>
          <textarea
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-xl bg-white/5 border border-white/8 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/60 focus:shadow-[0_0_12px_rgba(251,146,60,0.15)]"
            placeholder="今天的感受如何？"
            maxLength={200}
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || !selectedType || !duration}
          className="btn-press w-full rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-4 text-lg font-bold text-white shadow-glow-primary transition-all disabled:opacity-40 disabled:shadow-none animate-fade-in-up"
          style={{ animationDelay: "250ms" }}
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              打卡中...
            </span>
          ) : (
            "完成打卡 🔥"
          )}
        </button>
      </form>
    </main>
  );
}
