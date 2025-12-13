"use client";
import { useProducts } from "@/hooks/use-products";
import { RenderingProducts } from "../product/rendering-products";
import { ProductSearchBar } from "../product/product-search-bar";
import { useProductQueryState } from "@/hooks/use-product-query-state";
import { Category } from "@/types";
import { ProductCategoryFilter } from "../product/product-category-filter";

export default function ProductPageClient({
  categories,
}: {
  categories: Category[];
}) {
  const state = useProductQueryState(categories, 48);

  const { products, loading } = useProducts({
    page: state.page,
    limit: state.limit,
    categoryId: state.selectedCategory?.id,
    search: state.debouncedSearch,
    inStock: true,
  });

  return (
    <>
      <section className="bg-linear-to-r from-purple-600 to-indigo-700 text-white py-16">
        <ProductSearchBar
          value={state.search}
          onChange={state.setSearch}
          onSubmit={() => state.updateUrl("search", state.search)}
        />
      </section>
      <section className="py-12 w-full flex justify-center items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductCategoryFilter
            categories={categories}
            selectedSlug={state.categorySlug}
            onSelect={(slug) => state.updateUrl("category", slug)}
          />
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <RenderingProducts products={products} loading={loading} />
        </div>
      </section>
    </>
  );
}
