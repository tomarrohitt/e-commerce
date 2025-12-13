"use client";

import Link from "next/link";
import { useProducts } from "@/hooks/use-products";
import { RenderingProducts } from "../product/rendering-products";

export default function ProductFeaturePage() {
  const { products, loading } = useProducts({
    inStock: true,
    limit: 12,
  });

  return (
    <>
      <section className="bg-linear-to-r from-purple-600 to-indigo-700 text-white py-16"></section>
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 text-start">
              Featured Products
            </h2>
            <Link
              href="/products"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              View All →
            </Link>
          </div>
          <RenderingProducts products={products} loading={loading} />
        </div>
      </section>
    </>
  );
}
