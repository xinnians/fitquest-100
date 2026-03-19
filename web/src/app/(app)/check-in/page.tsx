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

  // Estimate calories (using 70kg default for display, server uses actual weight)
  const estimatedCalories =
    selectedType && duration
      ? calculateCaloriesBurned(selectedType, 70, parseInt(duration, 10) || 0)
      : 0;

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await createCheckIn(formData);
      if (result && "success" in result) {
        setLastCalories(result.data?.calories_burned ?? estimatedCalories);
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
        onClose={() => setShowSuccess(false)}
      />
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="font-heading text-3xl font-extrabold">運動打卡</h1>
      <p className="mt-1 text-muted">最低 15 分鐘 = 1 次有效打卡</p>

      <form action={formAction} className="mt-6 space-y-6">
        {/* Exercise Type Grid */}
        <div>
          <label className="mb-3 block text-sm font-semibold">選擇運動類型</label>
          <div className="grid grid-cols-3 gap-2">
            {EXERCISE_TYPES.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => setSelectedType(exercise.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-sm transition-all ${
                  selectedType === exercise.id
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card text-foreground hover:border-primary/50"
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
        <div>
          <label className="mb-2 block text-sm font-semibold">運動時長（分鐘）</label>
          <div className="flex gap-2">
            {["15", "30", "45", "60", "90"].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setDuration(val)}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  duration === val
                    ? "bg-primary text-white"
                    : "border border-border bg-card text-foreground hover:border-primary/50"
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
            className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
            placeholder="或直接輸入分鐘數"
            min="1"
            max="480"
            required
          />
        </div>

        {/* Calorie Estimate */}
        {estimatedCalories > 0 && (
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-center">
            <p className="text-sm text-muted">預估消耗</p>
            <p className="font-heading text-3xl font-black text-accent">
              {estimatedCalories}
              <span className="ml-1 text-base font-normal text-muted">kcal</span>
            </p>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="mb-2 block text-sm font-semibold">備註（選填）</label>
          <textarea
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
            placeholder="今天的感受如何？"
            maxLength={200}
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || !selectedType || !duration}
          className="w-full rounded-xl bg-primary px-4 py-4 text-lg font-bold text-white shadow-card transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {isPending ? "打卡中..." : "完成打卡 🔥"}
        </button>
      </form>
    </main>
  );
}
