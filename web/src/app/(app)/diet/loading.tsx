import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function DietLoading() {
  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-1 h-8 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-16 rounded-xl" />
      </div>

      {/* Nutrient chart */}
      <div className="mt-4">
        <CardSkeleton />
      </div>

      {/* Meals list */}
      <Skeleton className="mb-3 mt-6 h-5 w-24" />
      <div className="space-y-3">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </main>
  );
}
