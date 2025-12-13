import Link from "next/link";
import type { Product } from "@/types";
import AddToCartButton from "./add-to-cart";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative h-48 bg-linear-to-br from-purple-400 to-indigo-600 overflow-hidden">
          {product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-6xl">📦</span>
            </div>
          )}

          {isOutOfStock && (
            <span className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Out of Stock
            </span>
          )}

          {product.category && (
            <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-purple-600">
              {product.category.name}
            </span>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col grow">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-purple-600">
            ${product.price}
          </span>

          <span
            className={`text-sm font-medium ${
              isOutOfStock ? "text-red-500" : "text-gray-500"
            }`}
          >
            {isOutOfStock ? "Out of stock" : `${product.stockQuantity} left`}
          </span>
        </div>

        <div className="mt-auto">
          <AddToCartButton productId={product.id} isOutOfStock={isOutOfStock} />
        </div>
      </div>
    </div>
  );
}
