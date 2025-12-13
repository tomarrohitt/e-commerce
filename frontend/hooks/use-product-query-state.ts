"use client";

import { useMemo, useState } from "react";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { useDebounce } from "@/hooks/use-debounce";

import type { Category } from "@/types";

export function useProductQueryState(
  categories: Category[],

  defaultLimit = 25,
) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);

  const limit = Number(searchParams.get("limit") ?? defaultLimit);

  const categorySlug = searchParams.get("category") ?? "";

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const debouncedSearch = useDebounce(search, 400);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === categorySlug) ?? null,

    [categories, categorySlug],
  );

  const updateUrl = (key: string, value?: string | number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, String(value));
    else params.delete(key);

    if (key !== "page") params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return {
    page,

    limit,

    categorySlug,

    selectedCategory,

    search,

    setSearch,

    debouncedSearch,

    updateUrl,
  };
}
