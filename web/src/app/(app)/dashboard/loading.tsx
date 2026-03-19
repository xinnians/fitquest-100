import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <Skeleton className="mb-1 h-8 w-48" />
      <Skeleton className="mb-6 h-4 w-36" />

      {/* Streak */}
      <CardSkeleton />

      {/* Calorie Gauge */}
      <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card">
        <Skeleton className="mb-3 h-5 w-32" />
        <div className="flex items-center gap-6">
          <Skeleton className="h-[140px] w-[140px] rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>

      {/* Waffle Chart */}
      <div className="mt-4">
        <CardSkeleton />
      </div>

      {/* Weekly Chart */}
      <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card">
        <Skeleton className="mb-3 h-5 w-24" />
        <Skeleton className="h-48 w-full" />
      </div>
    </main>
  );
}
