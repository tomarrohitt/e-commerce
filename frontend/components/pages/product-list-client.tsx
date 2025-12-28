"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductCategoryFilter } from "@/components/product/product-category-filter";

export default function ProductListClient({
  initialProducts,
  categories,
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(
    searchParams.get("category") || "",
  );

  useEffect(() => {
    setSelectedCategorySlug(searchParams.get("category") || "");
  }, [searchParams]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategorySlug(slug);
    const params = new URLSearchParams(searchParams);
    if (slug) params.set("category", slug);
    else params.delete("category");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <>
      <section className="py-8">
        <ProductCategoryFilter
          categories={categories}
          selectedSlug={selectedCategorySlug}
          onSelect={handleCategoryChange}
        />
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductGrid products={initialProducts} />
        </div>
      </section>
    </>
  );
}
