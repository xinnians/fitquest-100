import { Skeleton, CardSkeleton, GaugeSkeleton, ChartSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <Skeleton className="mb-1 h-8 w-48" />
      <Skeleton className="mb-6 h-4 w-36" />

      <div className="space-y-4">
        <CardSkeleton />
        <GaugeSkeleton />
        <CardSkeleton />
        <ChartSkeleton />
      </div>
    </main>
  );
}
