"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth-actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await signInWithEmail(formData);
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
        <p className="mt-2 text-center text-muted">登入以開始你的冒險</p>

        <div className="mt-8 space-y-4">
          {/* Google OAuth */}
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 font-medium shadow-card transition-colors hover:bg-background"
          >
            <GoogleIcon />
            使用 Google 登入
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted">或使用 Email</span>
            </div>
          </div>

          {/* Email/Password */}
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
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                minLength={6}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
                placeholder="至少 6 個字元"
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
              {isPending ? "登入中..." : "登入"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          還沒有帳號？{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            註冊
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
