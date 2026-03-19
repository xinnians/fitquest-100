import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <Skeleton className="mb-6 h-8 w-16" />

      {/* Profile card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="mb-1 h-6 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-10" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      </div>

      {/* Weight chart */}
      <div className="mt-6">
        <CardSkeleton />
      </div>

      {/* Sign out */}
      <Skeleton className="mt-6 h-12 w-full" />
    </main>
  );
}
