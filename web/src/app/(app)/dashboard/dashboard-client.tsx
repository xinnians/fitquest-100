"use client";

import { StreakDisplay } from "@/components/features/streak-display";
import { WaffleChart } from "@/components/features/waffle-chart";
import { CalorieGauge } from "@/components/features/calorie-gauge";
import { WeeklyChart } from "@/components/features/weekly-chart";

interface DashboardData {
  profile: {
    nickname: string;
    daily_calorie_goal: number;
    created_at: string;
  } | null;
  streak: {
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
    checkedInDates: string[];
  };
  today: {
    hasCheckedIn: boolean;
    checkInCount: number;
    caloriesBurned: number;
    caloriesConsumed: number;
    caloriesGoal: number;
  };
  weeklyData: { date: string; label: string; burned: number }[];
  challengeStartDate: string;
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const checkedInDatesSet = new Set(data.streak.checkedInDates);

  return (
    <div className="mt-6 space-y-6">
      {/* Streak */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <StreakDisplay
          currentStreak={data.streak.currentStreak}
          longestStreak={data.streak.longestStreak}
        />
      </section>

      {/* Calorie Gauge */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="mb-3 font-heading text-lg font-bold">今日熱量收支</h3>
        <CalorieGauge
          consumed={data.today.caloriesConsumed}
          burned={data.today.caloriesBurned}
          goal={data.today.caloriesGoal}
        />
      </section>

      {/* Waffle Chart */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <WaffleChart
          startDate={data.challengeStartDate}
          checkedInDates={checkedInDatesSet}
        />
      </section>

      {/* Weekly Chart */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <WeeklyChart data={data.weeklyData} />
      </section>
    </div>
  );
}
