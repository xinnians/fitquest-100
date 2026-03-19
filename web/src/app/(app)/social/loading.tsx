import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function SocialLoading() {
  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </main>
  );
}
