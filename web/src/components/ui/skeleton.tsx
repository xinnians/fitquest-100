export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl bg-white/5 animate-shimmer ${className}`}
      style={style}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-5">
      <Skeleton className="mb-3 h-5 w-1/3" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function GaugeSkeleton() {
  return (
    <div className="glass-card p-5 flex flex-col items-center">
      <Skeleton className="h-40 w-40 rounded-full" />
      <div className="mt-4 flex gap-6">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-16" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-card p-5">
      <Skeleton className="mb-4 h-5 w-1/4" />
      <div className="flex items-end justify-between gap-2 h-28">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <Skeleton className="mb-2 h-8 w-40" />
      <Skeleton className="mb-6 h-4 w-56" />
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </main>
  );
}
