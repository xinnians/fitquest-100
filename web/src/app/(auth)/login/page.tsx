"use client";

import Link from "next/link";
import { useState, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signInWithEmail, signInWithGoogle, signInWithApple, signInWithLINE } from "@/lib/auth-actions";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const urlMessage = searchParams.get("message");

  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await signInWithEmail(formData);
      return result ?? null;
    },
    null
  );

  function handleOAuth(provider: string, action: () => Promise<void>) {
    setOauthLoading(provider);
    action().catch(() => setOauthLoading(null));
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-center font-heading text-4xl font-black text-primary">
        FitQuest 100
      </h1>
      <p className="mt-2 text-center text-muted">登入以開始你的冒險</p>

      {/* URL-based messages */}
      {urlError === "oauth_failed" && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          第三方登入失敗，請重試或使用 Email 登入
        </p>
      )}
      {urlError && urlError.startsWith("line") && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          LINE 登入失敗，請重試或使用其他方式登入
        </p>
      )}
      {urlMessage === "password_reset_success" && (
        <p className="mt-4 rounded-lg bg-accent/10 px-3 py-2 text-center text-sm text-accent">
          密碼已重設成功，請使用新密碼登入
        </p>
      )}

      <div className="mt-8 space-y-3">
        {/* LINE Login */}
        <button
          type="button"
          onClick={() => handleOAuth("line", signInWithLINE)}
          disabled={oauthLoading !== null}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#06C755] px-4 py-3 font-medium text-white shadow-card transition-colors hover:bg-[#05b04c] disabled:opacity-50"
        >
          {oauthLoading === "line" ? (
            "連線中..."
          ) : (
            <>
              <LINEIcon />
              使用 LINE 登入
            </>
          )}
        </button>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={() => handleOAuth("google", signInWithGoogle)}
          disabled={oauthLoading !== null}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 font-medium shadow-card transition-colors hover:bg-background disabled:opacity-50"
        >
          {oauthLoading === "google" ? (
            "連線中..."
          ) : (
            <>
              <GoogleIcon />
              使用 Google 登入
            </>
          )}
        </button>

        {/* Apple Sign In */}
        <button
          type="button"
          onClick={() => handleOAuth("apple", signInWithApple)}
          disabled={oauthLoading !== null}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-black px-4 py-3 font-medium text-white shadow-card transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {oauthLoading === "apple" ? (
            "連線中..."
          ) : (
            <>
              <AppleIcon />
              使用 Apple 登入
            </>
          )}
        </button>

        <div className="relative py-1">
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
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                密碼
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                忘記密碼？
              </Link>
            </div>
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
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function LINEIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}
