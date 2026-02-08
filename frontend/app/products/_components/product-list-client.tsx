"use client";

import { ProductGrid } from "./product-grid";
import { Category, ProductListProduct } from "@/types";
import {
  ArrowUpDown,
  Filter,
  Search,
  Tag,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function ProductListClient({
  initialProducts,
  categories,
  pagination: initialPagination,
}: {
  initialProducts: ProductListProduct[];
  categories: Category[];
  pagination: Pagination;
}) {
  const [products, setProducts] =
    useState<ProductListProduct[]>(initialProducts);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState([1, 1000]);
  const [committedPriceRange, setCommittedPriceRange] = useState([1, 1000]);
  const [min, max] = committedPriceRange;

  const router = useRouter();
  const searchParams = useSearchParams();

  const hasMore = pagination.page < pagination.totalPages;

  const handleClearFilters = () => {
    setPriceRange([1, 1000]);
    setCommittedPriceRange([1, 1000]);
    setSelectedCategory("all");
    setSortBy("default");
    setProducts(initialProducts);
    setPagination(initialPagination);
  };

  useEffect(() => {
    const category = searchParams.get("category");
    const sortByParam = searchParams.get("sortBy");
    const sortOrderParam = searchParams.get("sortOrder");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");

    if (category) {
      setSelectedCategory(category);
    }

    if (sortByParam && sortOrderParam) {
      setSortBy(`${sortByParam}-${sortOrderParam}`);
    }

    if (minPriceParam || maxPriceParam) {
      const min = minPriceParam ? parseFloat(minPriceParam) : 1;
      const max = maxPriceParam ? parseFloat(maxPriceParam) : 1000;
      setPriceRange([min, max]);
      setCommittedPriceRange([min, max]);
    }
  }, []);

  useEffect(() => {
    if (initialPagination.page === 1) {
      setProducts(initialProducts);
      setPagination(initialPagination);
    }
  }, [initialProducts, initialPagination]);

  // Update URL when filters change - debounced
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    if (sortBy !== "default") {
      const [field, order] = sortBy.split("-");
      params.set("sortBy", field);
      params.set("sortOrder", order);
    } else {
      params.delete("sortBy");
      params.delete("sortOrder");
    }

    if (min !== 1) {
      params.set("minPrice", String(min));
    } else {
      params.delete("minPrice");
    }

    if (max !== 1000) {
      params.set("maxPrice", String(max));
    } else {
      params.delete("maxPrice");
    }

    params.delete("page");

    const newUrl = params.toString();
    const currentUrl = searchParams.toString();

    if (newUrl !== currentUrl) {
      router.replace(`?${newUrl}`, { scroll: false });
    }
  }, [selectedCategory, sortBy, min, max]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const params = new URLSearchParams(searchParams.toString());
      const nextPage = pagination.page + 1;
      params.set("page", String(nextPage));

      const response = await fetch(`/web-api/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      if (data.products && data.products.length > 0) {
        // Use functional update and batch the state updates
        setProducts((prev) => [...prev, ...data.products]);
        setPagination(data.pagination);

        // Update URL in next tick to not block rendering
        setTimeout(() => {
          router.replace(`?${params.toString()}`, { scroll: false });
        }, 0);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [pagination.page, searchParams, isLoadingMore, router]);

  // Memoize products to prevent unnecessary re-renders
  const memoizedProducts = useMemo(() => products, [products]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  className={cn(
                    "rounded-full px-4 h-9 transition-all",
                    selectedCategory !== "all" &&
                      " bg-slate-200 text-slate-800 hover:bg-slate-100",
                  )}
                  onClick={() => setSelectedCategory("all")}
                >
                  All Products
                </Button>

                {categories.map((category) => (
                  <Button
                    key={category.slug}
                    className={cn(
                      "rounded-full px-4 h-9 transition-all",
                      selectedCategory !== category.slug &&
                        " bg-slate-200 text-slate-800 hover:bg-slate-100",
                    )}
                    onClick={() => setSelectedCategory(category.slug)}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 mr-2 opacity-70" />
                    {category.name}
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-white/20 text-current hover:bg-white/30 h-5 px-1.5 min-w-5"
                    >
                      {category._count?.products}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
              <div className="flex-1 w-full lg:max-w-md space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Price Range
                  </label>
                  <span className="text-sm font-semibold text-slate-900">
                    ${priceRange[0]} - ${priceRange[1]}
                  </span>
                </div>
                <Slider
                  value={priceRange}
                  min={1}
                  max={1000}
                  step={1}
                  onValueChange={(value) => setPriceRange(value)}
                  onValueCommit={(value) => setCommittedPriceRange(value)}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-45 rounded-lg bg-white border-slate-200">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4 text-slate-500" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Featured</SelectItem>
                    <SelectItem value="price-asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-desc">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating-asc">
                      Rating: Low to High
                    </SelectItem>
                    <SelectItem value="rating-desc">
                      Rating: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            Showing{" "}
            <span className="font-bold text-slate-900">{products.length}</span>{" "}
            of{" "}
            <span className="font-bold text-slate-900">{pagination.total}</span>{" "}
            product
            {pagination.total !== 1 ? "s" : ""}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No products found
            </h3>
            <p className="text-slate-500 mb-6 text-center max-w-sm">
              We couldn&apos;t find any products matching your current filters.
              Try adjusting your search or category.
            </p>
            <Button
              onClick={handleClearFilters}
              className="bg-blue-500 hover:bg-blue-600 rounded-full px-8"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <ProductGrid products={memoizedProducts} />

            {hasMore && (
              <div className="flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="bg-blue-500 hover:bg-blue-600 rounded-full px-8 h-12 text-base font-medium shadow-sm transition-all hover:shadow-md disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    <>
                      Load More Products
                      <span className="ml-2 text-xs opacity-75">
                        ({pagination.total - products.length} remaining)
                      </span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
