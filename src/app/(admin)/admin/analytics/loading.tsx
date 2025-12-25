import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsLoading() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-4 w-40 mb-2" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-canvas border-2 border-timber-dark p-6 relative">
            <div className="joint" style={{ top: '-6px', left: '-6px' }} />
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-3 w-32 mb-2" />
                <Skeleton className="h-10 w-24 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-canvas border-2 border-timber-dark p-6 relative">
            <div className="joint" style={{ top: '-6px', left: '-6px' }} />
            <div className="joint" style={{ top: '-6px', right: '-6px' }} />
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Goal Progress */}
      <div className="bg-timber-dark p-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />
        <Skeleton className="h-6 w-64 mb-6 bg-canvas/20" />
        <Skeleton className="h-6 w-full mb-4 bg-canvas/20" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-24 bg-canvas/20" />
          <Skeleton className="h-10 w-32 bg-canvas/20" />
        </div>
      </div>
    </div>
  );
}
