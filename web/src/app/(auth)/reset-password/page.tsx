"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/auth-actions";

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await updatePassword(formData);
      return result ?? null;
    },
    null
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center font-heading text-4xl font-black text-primary">
          FitQuest 100
        </h1>
        <p className="mt-2 text-center text-muted">設定新密碼</p>

        <div className="mt-8">
          <form action={formAction} className="space-y-3">
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                新密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={6}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
                placeholder="至少 6 個字元"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="mb-1 block text-sm font-medium">
                確認新密碼
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                autoComplete="new-password"
                minLength={6}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
                placeholder="再輸入一次"
              />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-card transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {isPending ? "設定中..." : "設定新密碼"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
