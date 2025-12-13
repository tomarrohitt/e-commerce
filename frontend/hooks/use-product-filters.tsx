"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import type { Category, Pagination } from "@/types";

const defaultPagination: Pagination = {
  total: 0,
  page: 1,
  limit: 25,
  totalPages: 0,
};

interface UseProductFiltersOptions {
  defaultLimit?: number;
  enableStockFilter?: boolean;
}

export function useProductFilters(
  categories: Category[],
  options: UseProductFiltersOptions = {},
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Destructure options with defaults
  const { defaultLimit = 25, enableStockFilter = true } = options;

  // --- 1. State & URL Params Parsing ---
  const selectedCategorySlug = searchParams.get("category") || "";

  // Local state for search input (to allow typing before debouncing)
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  const page = parseInt(searchParams.get("page") || "1", 10);

  // Use URL limit if present, otherwise fallback to options
  const limit = parseInt(
    searchParams.get("limit") || defaultLimit.toString(),
    10,
  );

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // --- 2. Derived State (Category Matching) ---
  const selectedCategory = useMemo(() => {
    if (!selectedCategorySlug) return null;
    const match = categories.find((c) => c.slug === selectedCategorySlug);
    // If we have a slug but no match in the array, we return null (and won't fetch)
    return match ? { id: match.id, name: match.name } : null;
  }, [categories, selectedCategorySlug]);

  // --- 3. API Query Construction ---
  const queryParams = {
    page,
    limit,
    // Only add categoryId if we actually found the category object
    ...(selectedCategory?.id && { categoryId: selectedCategory.id }),
    // Only add search if user typed something
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    // Add stock filter if enabled
    ...(enableStockFilter && { inStock: true }),
  };

  // --- 4. Data Fetching ---
  const { data, isLoading: loadingProducts } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => productService.getProducts(queryParams),
    // Prevent query if a category is selected in URL but not found in list yet
    enabled: !selectedCategorySlug || !!selectedCategory,
    // Keep previous data while fetching new page to prevent flash
    placeholderData: (previousData) => previousData,
  });

  // --- 5. Helper: Update URL ---
  const updateUrl = (newParams: URLSearchParams) => {
    // scroll: false prevents jumping to top of page on every filter click
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  // --- 6. Event Handlers ---

  /**
   * Generic handler to set any filter key
   */
  const handleFilterChange = (key: string, value: string | number | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, String(value));
    } else {
      params.delete(key);
    }

    // Always reset to Page 1 when changing filters (except when changing page itself)
    if (key !== "page") {
      params.set("page", "1");
    }

    updateUrl(params);
  };

  const handlePageChange = (newPage: number) => {
    handleFilterChange("page", newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    handleFilterChange("limit", newLimit);
  };

  const handleCategoryChange = (slug: string | null) => {
    handleFilterChange("category", slug);
  };

  return {
    // Data
    products: data?.products || [],
    pagination: data?.pagination || { ...defaultPagination, limit },
    loadingProducts,

    // Current State
    selectedCategorySlug,
    selectedCategoryName: selectedCategory?.name || "",
    searchQuery,
    setSearchQuery, // Pass this to your <Input />

    // Actions
    handleFilterChange,
    handlePageChange,
    handleLimitChange,
    handleCategoryChange,
  };
}
