// src/components/Skeleton.jsx
export function SkeletonLine({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-white/5 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-3">
      <SkeletonLine className="h-4 w-3/4" />
      <SkeletonLine className="h-3 w-1/2" />
      <SkeletonLine className="h-3 w-1/3" />
      <div className="flex gap-2 mt-1">
        <SkeletonLine className="h-3 w-16" />
        <SkeletonLine className="h-3 w-16" />
      </div>
      <SkeletonLine className="h-8 w-full rounded-xl mt-1" />
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-white/5 animate-pulse" />
      <div className="flex flex-col gap-2 flex-1">
        <SkeletonLine className="h-4 w-1/3" />
        <SkeletonLine className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 rounded-xl border border-white/5">
          <SkeletonLine className="h-3 w-1/4" />
          <SkeletonLine className="h-3 w-1/4" />
          <SkeletonLine className="h-3 w-1/6" />
          <SkeletonLine className="h-3 w-1/6 ml-auto" />
        </div>
      ))}
    </div>
  );
}