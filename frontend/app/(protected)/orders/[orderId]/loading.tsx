import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-5 w-80 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Addresses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Skeleton */}
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {[1, 2].map((i) => (
                  <div key={i} className="p-6 flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse shrink-0"></div>
                    <div className="flex-1 flex justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address Skeleton */}
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mt-0.5"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address Skeleton */}
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <div className="h-6 w-36 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mt-0.5"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Summary & Payment Skeleton */}
        <div className="lg:col-span-1">
          <Card className="shadow-md sticky top-6">
            <CardHeader className="bg-gray-50 border-b">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
                <div className="pt-3 border-t flex justify-between items-center">
                  <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-7 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              <div className="mt-6">
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>

              <div className="mt-6 text-center">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
