import Link from "next/link";
import React from "react";

export const BackButtons = ({
  name,
  category,
}: {
  name: string;
  category: { name: string | undefined; slug: string | undefined };
}) => {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href="/products"
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            Products
          </Link>
          {category && (
            <>
              <span className="text-gray-400">/</span>
              <Link
                href={`/products?category=${category.slug}`}
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                {category.name}
              </Link>
            </>
          )}
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium truncate">{name}</span>
        </div>
      </div>
    </div>
  );
};
