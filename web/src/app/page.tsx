import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="text-center">
        <div className="text-6xl">🔥</div>
        <h1 className="mt-4 font-heading text-5xl font-black text-primary">
          FitQuest 100
        </h1>
        <p className="mt-4 text-lg text-muted">
          和朋友一起，開始你的 100 天運動冒險！
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-xl bg-primary px-8 py-3 font-bold text-white shadow-card transition-colors hover:bg-primary-hover"
          >
            開始冒險
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-border bg-card px-8 py-3 font-medium transition-colors hover:bg-background"
          >
            已有帳號？登入
          </Link>
        </div>
      </div>
    </main>
  );
}
