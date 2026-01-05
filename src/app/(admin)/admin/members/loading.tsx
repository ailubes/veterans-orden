import { Skeleton } from '@/components/ui/skeleton';

export default function MembersLoading() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-10 w-64 mb-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-panel-900 border border-line rounded-lg p-4">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="bg-panel-900 border border-line rounded-lg p-4 mb-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 flex-1 min-w-[200px]" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-panel-900 border border-line rounded-lg relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        {/* Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b-2 border-line bg-timber-dark/5">
          <div className="col-span-1">
            <Skeleton className="h-5 w-5" />
          </div>
          <Skeleton className="col-span-3 h-3" />
          <Skeleton className="col-span-2 h-3" />
          <Skeleton className="col-span-1 h-3" />
          <Skeleton className="col-span-2 h-3" />
          <Skeleton className="col-span-1 h-3" />
          <Skeleton className="col-span-2 h-3" />
        </div>

        {/* Rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-4 p-4 border-b border-line/20"
          >
            <div className="col-span-1 flex items-center">
              <Skeleton className="h-5 w-5" />
            </div>
            <div className="col-span-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="col-span-2 flex justify-end">
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
