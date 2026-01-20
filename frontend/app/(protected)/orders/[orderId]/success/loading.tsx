import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section Skeleton */}
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-12 w-64 md:w-96" />
          <Skeleton className="h-6 w-full max-w-md" />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Order Items (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md border-slate-100 overflow-hidden">
              <CardHeader className="bg-slate-50/50 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Fake Items Loop x3 */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      {/* Image Skeleton */}
                      <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons (Desktop) */}
            <div className="hidden lg:flex gap-4">
              <Skeleton className="flex-1 h-12 rounded-md" />
              <Skeleton className="flex-1 h-12 rounded-md" />
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Details (Span 1) */}
          <div className="space-y-6">
            {/* Status Card Skeleton */}
            <Card className="shadow-sm border-slate-100">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="pb-4 space-y-4">
                <Skeleton className="h-8 w-40 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>

            {/* Address Card Skeleton */}
            <Card className="shadow-sm border-slate-100">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-40 mt-2" />
              </CardContent>
            </Card>

            {/* What's Next (Colored Card Skeleton) */}
            <Card className="bg-blue-600/5 border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Action Buttons (Mobile Only) */}
            <div className="flex flex-col gap-3 lg:hidden">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>

            <div className="flex justify-center pt-2">
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
