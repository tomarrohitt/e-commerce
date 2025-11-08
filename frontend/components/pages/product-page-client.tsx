"use client";

import Link from "next/link";
import ProductCard from "@/components/product-card";
import type { Category } from "@/types";
import { useProductFilters } from "@/hooks/use-product-filters";

interface ProductPageClientProps {
  categories: Category[];
}

export default function ProductPageClient({
  categories,
}: ProductPageClientProps) {
  // Call the hook to get all the logic and state
  const {
    products,
    loadingProducts,
    selectedCategorySlug,
    selectedCategoryName,
    searchQuery,
    setSearchQuery,
    handleFilterChange,
  } = useProductFilters(categories);

  // Form submit handler is simple
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange("search", searchQuery);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-linear-r from-purple-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to E-Store
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              Discover amazing products at unbeatable prices
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-purple-300"
                />
                <button
                  type="submit"
                  className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Shop by Category
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleFilterChange("category", "")}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategorySlug === ""
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Products
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleFilterChange("category", category.slug)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedCategorySlug === category.slug
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
                {category._count && (
                  <span className="ml-2 text-sm opacity-75">
                    ({category._count.products})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedCategoryName
                ? `${selectedCategoryName} Products`
                : "Featured Products"}
            </h2>
            <Link
              href="/products"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              View All →
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No products found.
                {selectedCategorySlug &&
                !selectedCategoryName &&
                categories.length > 0
                  ? " That category was not found."
                  : " Try a different search or category."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
