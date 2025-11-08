import Link from "next/link";
import type { Product } from "@/types";
import AddToCartButton from "./add-to-cart"; // Ensure this path is correct

interface ProductCardProps {
  product: Product;
}

// This is a Server Component, which is great for performance.
export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-48 bg-lineaer-to-br from-purple-400 to-indigo-600 overflow-hidden">
          {product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-6xl">📦</span>
            </div>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Out of Stock
            </div>
          )}

          {/* Category Badge */}
          {product.category && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-purple-600">
              {product.category.name}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col grow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>

          <p className="text-sm text-gray-600 mb-3 truncate">
            {product.description}
          </p>

          {/* This is the new/restored section */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xl font-bold text-purple-600">
                ${product.price.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {isOutOfStock ? (
                <span className="text-red-500 font-medium">Out of stock</span>
              ) : (
                <span>{product.stockQuantity} left</span>
              )}
            </div>
          </div>

          <div className="grow"></div>
          <AddToCartButton productId={product.id} isOutOfStock={isOutOfStock} />
        </div>
      </div>
    </Link>
  );
}
