import { Skeleton } from "@/components/ui/skeleton";

export function TaskDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        {/* Title */}
        <Skeleton className="h-9 w-3/4" />
        {/* Status and priority */}
        <div className="flex gap-3">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-24 w-full" />
        </div>
        {/* Tags */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
      {/* Sidebar */}
      <div className="space-y-6 rounded-lg border p-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}
