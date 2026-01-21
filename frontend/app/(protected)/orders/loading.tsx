import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="pt-0 overflow-hidden">
            <CardHeader className="bg-gray-50 border-b pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Skeleton className="h-3.5 w-12 mb-1" /> {/* text-sm */}
                  <Skeleton className="h-5 w-60" /> {/* mono id */}
                </div>
                <div>
                  <Skeleton className="h-3.5 w-9 mb-1" />
                  <Skeleton className="h-5 w-35" />
                </div>
                <div>
                  <Skeleton className="h-3.5 w-9 mb-1" />
                  <Skeleton className="h-6 w-20" /> {/* text-lg */}
                </div>
                <Skeleton className="h-6 w-24 rounded-full" /> {/* badge */}
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-3 mb-4">
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    className="flex items-center gap-4 p-3 rounded-lg border border-gray-100"
                  >
                    <Skeleton className="w-16 h-16 rounded-lg shrink-0" />

                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-5 w-3/4 max-w-50" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>

                    <div className="shrink-0">
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50/50 rounded-lg p-4 mb-4 space-y-2">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <Skeleton className="h-10 w-28 rounded-md" />
                <Skeleton className="h-10 w-36 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
