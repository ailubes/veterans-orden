import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsLoading() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Send Form Skeleton */}
        <div>
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10" />
                  ))}
                </div>
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>

        {/* History Skeleton */}
        <div>
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="bg-panel-900 border border-line rounded-lg relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <div className="max-h-[600px] overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-4 border-b border-line/20 space-y-2"
                >
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 flex-1" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
