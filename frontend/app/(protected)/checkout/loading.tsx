import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Lock } from "lucide-react";

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              Secure Checkout
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-48 sm:w-64" />
          <Skeleton className="h-5 w-72" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/30 py-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />{" "}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl border border-transparent bg-muted/30"
                  >
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-5 h-5 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/30 py-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />{" "}
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="p-4 rounded-xl bg-accent/5 ring-1 ring-border shadow-sm mb-5">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-5 h-5 rounded-full shrink-0" />
                    <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm overflow-hidden sticky top-24">
              <CardHeader className="border-b bg-muted/30 py-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4 mb-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-5" />

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-end">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>

                <Skeleton className="w-full h-12 rounded-md" />

                <div className="mt-4 space-y-2 flex flex-col items-center">
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
