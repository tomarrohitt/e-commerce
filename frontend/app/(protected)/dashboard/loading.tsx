export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-linear-to-r from-blue-500 to-indigo-700 rounded-2xl p-8 text-white mb-8">
        <div className="h-8 bg-blue-400/30 rounded-lg w-80 mb-2 animate-pulse"></div>
        <div className="h-5 bg-blue-400/30 rounded w-64 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-16 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="h-7 bg-gray-200 rounded-lg w-40 mb-6 animate-pulse"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="h-7 bg-gray-200 rounded-lg w-52 mb-6 animate-pulse"></div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center py-3 border-b border-gray-200"
            >
              <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div
                className={`h-5 bg-gray-200 rounded animate-pulse ${
                  i === 3 || i === 4 ? "w-20" : "w-40"
                }`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
