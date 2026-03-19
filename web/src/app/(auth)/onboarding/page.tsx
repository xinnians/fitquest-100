"use client";

import { useState, useActionState } from "react";
import { completeOnboarding } from "@/lib/onboarding-actions";

const STEPS = [
  { title: "基本資料", subtitle: "讓我們認識你" },
  { title: "身體數據", subtitle: "設定你的目標" },
  { title: "準備出發", subtitle: "開始你的冒險！" },
] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState("2000");

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await completeOnboarding(formData);
      return result ?? null;
    },
    null
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        <h1 className="font-heading text-2xl font-extrabold">
          {STEPS[step].title}
        </h1>
        <p className="mt-1 text-muted">{STEPS[step].subtitle}</p>

        <form action={formAction}>
          {/* Hidden fields to carry all data */}
          <input type="hidden" name="nickname" value={nickname} />
          <input type="hidden" name="gender" value={gender} />
          <input type="hidden" name="weight_kg" value={weightKg} />
          <input type="hidden" name="daily_calorie_goal" value={dailyCalorieGoal} />

          <div className="mt-6 space-y-4">
            {/* Step 1: Nickname + Gender */}
            {step === 0 && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    暱稱 <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
                    placeholder="你想怎麼被稱呼？"
                    required
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">性別</label>
                  <div className="flex gap-3">
                    {[
                      { value: "male", label: "男" },
                      { value: "female", label: "女" },
                      { value: "other", label: "不透露" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGender(option.value)}
                        className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                          gender === option.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-foreground hover:border-primary/50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Weight + Calorie Goal */}
            {step === 1 && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    體重 (kg)
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
                    placeholder="例如：70"
                    min="30"
                    max="300"
                    step="0.1"
                  />
                  <p className="mt-1 text-xs text-muted">用於計算運動卡路里消耗</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    每日目標卡路里 (kcal)
                  </label>
                  <input
                    type="number"
                    value={dailyCalorieGoal}
                    onChange={(e) => setDailyCalorieGoal(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
                    placeholder="2000"
                    min="1000"
                    max="5000"
                    step="50"
                  />
                  <div className="mt-2 flex gap-2">
                    {["1500", "1800", "2000", "2500"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDailyCalorieGoal(val)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          dailyCalorieGoal === val
                            ? "bg-primary text-white"
                            : "bg-card border border-border text-muted hover:text-foreground"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Ready */}
            {step === 2 && (
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <div className="text-5xl">🔥</div>
                <h2 className="mt-4 font-heading text-xl font-bold">準備好了嗎？</h2>
                <p className="mt-2 text-sm text-muted">
                  Hi <span className="font-medium text-foreground">{nickname || "冒險者"}</span>，
                  你的 100 天冒險即將開始！
                </p>
                <div className="mt-4 space-y-1 text-left text-sm text-muted">
                  {weightKg && <p>體重：{weightKg} kg</p>}
                  <p>每日目標：{dailyCalorieGoal} kcal</p>
                </div>
              </div>
            )}
          </div>

          {state?.error && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-3 font-medium transition-colors hover:bg-background"
              >
                上一步
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 0 && !nickname.trim()}
                className="flex-1 rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-card transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                下一步
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-xl bg-accent px-4 py-3 font-bold text-white shadow-card transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {isPending ? "啟動中..." : "開始冒險！"}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
