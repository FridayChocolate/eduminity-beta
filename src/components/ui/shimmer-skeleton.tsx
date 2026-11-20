import { cn } from "@/lib/utils";

interface ShimmerSkeletonProps {
  className?: string;
}

export const ShimmerSkeleton = ({ className }: ShimmerSkeletonProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/50",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "before:animate-shimmer",
        "motion-reduce:before:animate-none",
        className
      )}
    />
  );
};

// Card Skeleton
export const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("rounded-xl border border-border bg-card p-4 space-y-3", className)}>
    <ShimmerSkeleton className="h-4 w-3/4" />
    <ShimmerSkeleton className="h-3 w-1/2" />
    <div className="pt-2 space-y-2">
      <ShimmerSkeleton className="h-3 w-full" />
      <ShimmerSkeleton className="h-3 w-5/6" />
    </div>
    <div className="flex gap-2 pt-2">
      <ShimmerSkeleton className="h-8 w-20 rounded-full" />
      <ShimmerSkeleton className="h-8 w-16 rounded-full" />
    </div>
  </div>
);

// Dashboard Card Skeleton
export const DashboardCardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-5 space-y-4">
    <div className="flex items-center justify-between">
      <ShimmerSkeleton className="h-5 w-32" />
      <ShimmerSkeleton className="h-8 w-8 rounded-full" />
    </div>
    <ShimmerSkeleton className="h-8 w-24" />
    <div className="flex items-center gap-2">
      <ShimmerSkeleton className="h-3 w-12" />
      <ShimmerSkeleton className="h-3 w-16" />
    </div>
  </div>
);

// Notes List Skeleton
export const NotesListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card">
        <ShimmerSkeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <ShimmerSkeleton className="h-4 w-3/4" />
          <ShimmerSkeleton className="h-3 w-1/2" />
          <div className="flex gap-2">
            <ShimmerSkeleton className="h-5 w-12 rounded-full" />
            <ShimmerSkeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <ShimmerSkeleton className="h-8 w-20 rounded-md" />
      </div>
    ))}
  </div>
);

// Upload Table Skeleton
export const UploadTableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="rounded-lg border border-border overflow-hidden">
    {/* Header */}
    <div className="flex items-center gap-4 p-4 bg-muted/30 border-b border-border">
      <ShimmerSkeleton className="h-4 w-32" />
      <ShimmerSkeleton className="h-4 w-24" />
      <ShimmerSkeleton className="h-4 w-20" />
      <ShimmerSkeleton className="h-4 w-24 ml-auto" />
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
        <ShimmerSkeleton className="h-10 w-10 rounded-md" />
        <div className="flex-1 space-y-1">
          <ShimmerSkeleton className="h-4 w-48" />
          <ShimmerSkeleton className="h-3 w-32" />
        </div>
        <ShimmerSkeleton className="h-6 w-16 rounded-full" />
        <ShimmerSkeleton className="h-4 w-20" />
        <ShimmerSkeleton className="h-8 w-8 rounded-md" />
      </div>
    ))}
  </div>
);

// Profile Section Skeleton
export const ProfileSkeleton = () => (
  <div className="space-y-6">
    {/* Avatar and name */}
    <div className="flex items-center gap-4">
      <ShimmerSkeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2">
        <ShimmerSkeleton className="h-6 w-40" />
        <ShimmerSkeleton className="h-4 w-32" />
        <ShimmerSkeleton className="h-3 w-24" />
      </div>
    </div>
    {/* Stats */}
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center space-y-1">
          <ShimmerSkeleton className="h-8 w-16 mx-auto" />
          <ShimmerSkeleton className="h-3 w-20 mx-auto" />
        </div>
      ))}
    </div>
    {/* Bio */}
    <div className="space-y-2">
      <ShimmerSkeleton className="h-3 w-full" />
      <ShimmerSkeleton className="h-3 w-5/6" />
      <ShimmerSkeleton className="h-3 w-4/6" />
    </div>
  </div>
);

// Stats Grid Skeleton
export const StatsGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <DashboardCardSkeleton key={i} />
    ))}
  </div>
);
