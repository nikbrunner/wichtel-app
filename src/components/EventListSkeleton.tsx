import { Card } from "@/components/retroui/Card";
import { Skeleton } from "@/components/ui/skeleton";

export function EventListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="p-6">
          <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex justify-between flex-nowrap">
              <div className="flex-1">
                <div className="flex gap-2 mb-1">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-72" />
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-5 w-8" />
              </div>
              <div>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>

            {/* Button */}
            <Skeleton className="h-9 w-48 mt-2" />
          </div>
        </Card>
      ))}
    </div>
  );
}
