import { Home } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Home className="w-8 h-8 text-slate-300 animate-pulse" />
                <div className="h-9 bg-slate-200 rounded-lg w-64 animate-pulse"></div>
              </div>
              <div className="h-5 bg-slate-200 rounded w-80 animate-pulse"></div>
            </div>
            <div className="h-11 bg-slate-200 rounded-lg w-44 animate-pulse"></div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border-2 border-slate-200 shadow-sm"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-slate-200 rounded w-24 mb-2 animate-pulse"></div>
                      {i === 1 && (
                        <div className="h-5 bg-slate-200 rounded-full w-32 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-slate-200 rounded mt-0.5 animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-4/5 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-3/5 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  {i !== 1 && (
                    <div className="flex-1 h-9 bg-slate-200 rounded-lg animate-pulse"></div>
                  )}
                  <div className="h-9 bg-slate-200 rounded-lg w-20 animate-pulse"></div>
                  <div className="h-9 bg-slate-200 rounded-lg w-24 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
