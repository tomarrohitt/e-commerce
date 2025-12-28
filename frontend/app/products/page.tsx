import { Suspense } from "react";
import { productService } from "@/lib/api/products";
import { categoryService } from "@/lib/api/categories";
import ProductListClient from "@/components/pages/product-list-client";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { Category } from "@/types";

type Props = {
  // In Next.js 15, searchParams is a Promise
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
};

export default async function ProductsPage(props: Props) {
  // 1. Unwrap the params
  const searchParams = await props.searchParams;

  // 2. Fetch Categories first.
  // We need the full list to translate the URL 'slug' into a database 'id'.
  const categories = await categoryService.getCategories();

  // 3. Resolve the Category ID from the slug
  let selectedCategoryId: string | undefined = undefined;

  if (searchParams.category) {
    const matchedCategory = categories.find(
      (c: Category) => c.slug === searchParams.category,
    );
    selectedCategoryId = matchedCategory?.id;
  }

  // 4. Fetch Products using the resolved ID (not the slug)
  const products = await productService.getProducts({
    page: Number(searchParams.page) || 1,
    limit: 24,
    categoryId: selectedCategoryId, // ✅ Passing the ID here
    search: searchParams.search,
    inStock: true,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-linear-to-r from-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Shop Our Products</h1>
          <p className="text-xl text-purple-100">
            {searchParams.category
              ? `Viewing ${searchParams.category.replace("-", " ")}`
              : `Discover amazing deals on ${products.pagination.total} products`}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductListClient
          initialProducts={products.products}
          initialPagination={products.pagination}
          categories={categories}
        />
      </Suspense>
    </div>
  );
}

// Skeleton Loading State
export function ProductsPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col space-y-8">
        {/* Simulate Filter Bar */}
        <div className="flex gap-4 overflow-hidden">
          <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Simulate Grid */}
        <SkeletonGrid count={8} columns={4} />
      </div>
    </div>
  );
}
