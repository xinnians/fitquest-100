import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard-data";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <main className="mx-auto max-w-md px-4 pt-8">
        <p className="text-muted">無法載入數據，請重新登入。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">
            Hi, {data.profile?.nickname ?? "冒險者"} 👋
          </h1>
          <p className="text-sm text-muted">
            {data.today.hasCheckedIn
              ? "今天已打卡，繼續保持！"
              : "今天還沒打卡喔！"}
          </p>
        </div>
      </div>

      {/* Quick Check-in CTA */}
      {!data.today.hasCheckedIn && (
        <Link
          href="/check-in"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 font-bold text-white shadow-card transition-colors hover:bg-primary-hover"
        >
          <span className="text-xl">🔥</span>
          立即打卡
        </Link>
      )}

      <DashboardClient data={data} />
    </main>
  );
}
