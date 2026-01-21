import Link from "next/link";
import { Suspense } from "react";
import RenderingProducts from "@/components/product/rendering-products";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  return (
    <div className="min-h-full bg-gray-50">
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 text-start">
              Featured Products
            </h2>
            <Link
              href="/products"
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              View All →
            </Link>
          </div>
          <Suspense fallback={<ProductGridSkeleton />}>
            <RenderingProducts />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col"
        >
          <div className="relative h-48 bg-gray-100">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="p-4 flex flex-col grow">
            <div className="mb-2 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="flex items-center justify-between mb-4 mt-2">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="mt-auto">
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
