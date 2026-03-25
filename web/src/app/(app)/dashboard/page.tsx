import Link from "next/link";
import { Suspense } from "react";
import {
  getHeaderData,
  getStreakData,
  getCalorieData,
  getWaffleData,
  getWeeklyData,
} from "@/lib/dashboard-data";
import { getPlayerStats } from "@/lib/reward-actions";
import { StreakDisplay } from "@/components/features/streak-display";
import { CalorieGauge } from "@/components/features/calorie-gauge";
import { WaffleChart } from "@/components/features/waffle-chart";
import { WeeklyChart } from "@/components/features/weekly-chart";
import { CharacterAvatar } from "@/components/features/character-avatar";
import { XpBar } from "@/components/features/xp-bar";
import { CardSkeleton, GaugeSkeleton, ChartSkeleton } from "@/components/ui/skeleton";

async function StreakSection() {
  const data = await getStreakData();
  if (!data) return null;
  return (
    <section className="glass-card p-5 animate-fade-in-up">
      <StreakDisplay
        currentStreak={data.currentStreak}
        longestStreak={data.longestStreak}
        totalDays={data.totalDays}
      />
    </section>
  );
}

async function CalorieSection() {
  const data = await getCalorieData();
  if (!data) return null;
  return (
    <section className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
      <h3 className="mb-3 font-heading text-lg font-bold">今日熱量收支</h3>
      <CalorieGauge consumed={data.consumed} burned={data.burned} goal={data.goal} />
    </section>
  );
}

async function WaffleSection() {
  const data = await getWaffleData();
  if (!data) return null;
  return (
    <section className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
      <WaffleChart
        startDate={data.startDate}
        checkedInDates={new Set(data.checkedInDates)}
      />
    </section>
  );
}

async function WeeklySection() {
  const data = await getWeeklyData();
  if (!data) return null;
  return (
    <section className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
      <WeeklyChart data={data} />
    </section>
  );
}

async function XpSection() {
  const stats = await getPlayerStats();
  if (!stats) return null;
  return (
    <section className="animate-fade-in-up" style={{ animationDelay: "50ms" }}>
      <XpBar xp={stats.xp} level={stats.level} coins={stats.coins} />
    </section>
  );
}

export default async function DashboardPage() {
  const header = await getHeaderData();

  if (!header) {
    return (
      <main className="mx-auto max-w-md px-4 pt-8">
        <p className="text-muted">無法載入數據，請重新登入。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">
            Hi, {header.nickname ?? "冒險者"} 👋
          </h1>
          <p className="text-sm text-muted">
            {header.hasCheckedIn
              ? "今天已打卡，繼續保持！"
              : "今天還沒打卡喔！"}
          </p>
        </div>
        <Link href="/characters">
          <CharacterAvatar characterId={header.characterId} size={48} />
        </Link>
      </div>

      {/* Quick Check-in CTA */}
      {!header.hasCheckedIn && (
        <Link
          href="/check-in"
          className="btn-press mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-4 font-bold text-white shadow-glow-primary transition-all animate-fade-in-up"
          style={{ animationDelay: "50ms" }}
        >
          <span className="text-xl">🔥</span>
          立即打卡
        </Link>
      )}

      <div className="mt-6 space-y-4">
        <Suspense fallback={<CardSkeleton />}>
          <XpSection />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <StreakSection />
        </Suspense>
        <Suspense fallback={<GaugeSkeleton />}>
          <CalorieSection />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <WaffleSection />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <WeeklySection />
        </Suspense>
      </div>
    </main>
  );
}
