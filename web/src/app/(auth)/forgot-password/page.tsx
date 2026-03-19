"use client";

import Link from "next/link";
import { useState, useActionState } from "react";
import { resetPasswordRequest } from "@/lib/auth-actions";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await resetPasswordRequest(formData);
      if (result && "success" in result) {
        setSent(true);
        return null;
      }
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
        <p className="mt-2 text-center text-muted">重設你的密碼</p>

        {sent ? (
          <div className="mt-8 rounded-xl border border-accent/30 bg-accent/5 p-6 text-center">
            <div className="text-4xl">📧</div>
            <h2 className="mt-3 font-heading text-lg font-bold">信件已寄出</h2>
            <p className="mt-2 text-sm text-muted">
              請檢查你的信箱，點擊連結來重設密碼。
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              返回登入
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <form action={formAction} className="space-y-3">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
                  placeholder="you@example.com"
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
                {isPending ? "發送中..." : "發送重設連結"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              <Link href="/login" className="font-medium text-primary hover:underline">
                返回登入
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
