import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-linear-to-r from-purple-50 via-indigo-50 to-purple-50 rounded-2xl p-8 mb-8 border-2 border-purple-100 shadow-sm h-35 animate-pulse opacity-40"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md p-6 flex space-x-4 border-2 border-gray-100"
            >
              <div className="w-24 h-24 bg-linear-to-br from-gray-200 to-gray-300 rounded-lg animate-pulse shrink-0"></div>

              <div className="flex-1 flex flex-col">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-1 animate-pulse"></div>

                <div className="h-8 w-32 bg-gray-200 rounded mb-3 animate-pulse"></div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                      <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>
                      <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  <div className="text-right">
                    <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-lg border-2 border-gray-100">
            <CardHeader className="bg-linear-to-r from-purple-50 to-indigo-50 h-18">
              {""}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}

                <div className="border-t-2 border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="h-11 w-full bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
              <div className="h-11 w-full bg-gray-100 rounded-lg animate-pulse"></div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
