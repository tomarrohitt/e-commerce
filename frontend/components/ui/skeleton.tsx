import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className,
  variant = "rectangular",
  animation = "pulse",
}: SkeletonProps) {
  const animationClass = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  }[animation];

  const variantClass = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-xl",
  }[variant];

  return (
    <div
      className={cn("bg-gray-200", animationClass, variantClass, className)}
    />
  );
}

// ✅ Composable skeleton patterns
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn("bg-white rounded-xl shadow-md p-6 space-y-4", className)}
    >
      <Skeleton variant="rectangular" className="h-48 w-full" />
      <Skeleton variant="text" className="h-4 w-3/4" />
      <Skeleton variant="text" className="h-4 w-1/2" />
      <div className="flex justify-between items-center pt-4">
        <Skeleton variant="text" className="h-6 w-20" />
        <Skeleton variant="rectangular" className="h-10 w-24" />
      </div>
    </div>
  );
}

export function SkeletonList({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-white rounded-xl shadow-md p-6 space-y-3",
            className,
          )}
        >
          <div className="flex items-center space-x-4">
            <Skeleton variant="circular" className="h-12 w-12" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-4 w-3/4" />
              <Skeleton variant="text" className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({
  count = 8,
  columns = 4,
}: {
  count?: number;
  columns?: 2 | 3 | 4;
}) {
  const gridClass = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns];

  return (
    <div className={cn("grid gap-6", gridClass)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <Skeleton variant="text" className="h-6 w-1/4" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-6 flex items-center space-x-4">
            <Skeleton variant="rectangular" className="h-16 w-16" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-4 w-3/4" />
              <Skeleton variant="text" className="h-3 w-1/2" />
            </div>
            <Skeleton variant="rectangular" className="h-10 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
