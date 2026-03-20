import { Skeleton } from "@/components/ui/skeleton";

export default function CheckInLoading() {
  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <Skeleton className="mb-1 h-8 w-32" />
      <Skeleton className="mb-6 h-4 w-48" />

      {/* Exercise type grid */}
      <Skeleton className="mb-3 h-4 w-28" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="glass-card p-3">
            <Skeleton className="mx-auto h-8 w-8 rounded-full" />
            <Skeleton className="mx-auto mt-2 h-3 w-12" />
          </div>
        ))}
      </div>

      {/* Duration */}
      <Skeleton className="mb-2 mt-6 h-4 w-32" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-card flex-1 py-3">
            <Skeleton className="mx-auto h-4 w-8" />
          </div>
        ))}
      </div>

      {/* Submit button */}
      <Skeleton className="mt-6 h-14 w-full rounded-xl" />
    </main>
  );
}
