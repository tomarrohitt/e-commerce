import { Suspense } from "react";
import ProductListClient from "@/components/pages/product-list-client";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { getCategories, getProducts } from "@/lib/api/product-cached";

type Props = {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
};

export default async function ProductsPage(props: Props) {
  const searchParams = await props.searchParams;
  const categories = await getCategories();
  const products = await getProducts({ limit: 40 });

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-linear-to-r from-blue-500 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Shop Our Products</h1>
          <p className="text-xl text-blue-100">
            {searchParams.category
              ? `Viewing ${searchParams.category.replace("-", " ")}`
              : `Discover amazing deals on ${products.pagination.total} products`}
          </p>
        </div>
      </section>

      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductListClient
          initialProducts={products.products}
          categories={categories}
        />
      </Suspense>
    </div>
  );
}

function ProductsPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col space-y-8">
        <div className="flex gap-4 overflow-hidden">
          <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
        </div>

        <SkeletonGrid count={8} columns={4} />
      </div>
    </div>
  );
}
