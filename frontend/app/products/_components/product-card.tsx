import Link from "next/link";
import type { ProductListProduct } from "@/types";
import AddToCartButton from "./add-to-cart";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp } from "lucide-react";

interface ProductCardProps {
  product: ProductListProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10;

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100 h-full flex flex-col">
      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="block relative">
        <div className="relative h-64 bg-linear-to-br from-slate-100 via-blue-50 to-blue-50 overflow-hidden">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-20 w-20 text-slate-300" />
            </div>
          )}

          {/* Overlay linear */}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Stock Badge */}
          {isOutOfStock && (
            <Badge className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg text-xs font-bold px-3 py-1.5 rounded-full">
              Out of Stock
            </Badge>
          )}

          {isLowStock && !isOutOfStock && (
            <Badge className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Low Stock
            </Badge>
          )}

          {/* Category Badge */}
          {product.category && (
            <Badge className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm hover:bg-white text-slate-700 border border-slate-200 shadow-md text-xs font-bold px-3 py-1.5 rounded-full">
              {product.category.name}
            </Badge>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5 flex flex-col grow">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Price and Stock */}
        <div className="flex items-end justify-between mb-4 mt-auto">
          <div>
            <div className="text-3xl font-black bg-linear-to-r from-blue-500 to-blue-500 bg-clip-text text-transparent">
              ${product.price}
            </div>
          </div>

          <div className="text-right">
            <div
              className={`text-sm font-bold ${
                isOutOfStock
                  ? "text-blue-500"
                  : isLowStock
                    ? "text-blue-600"
                    : "text-emerald-600"
              }`}
            >
              {isOutOfStock ? (
                "Unavailable"
              ) : (
                <>
                  <span className="text-lg">{product.stockQuantity}</span>
                  <span className="text-xs ml-1">in stock</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        <AddToCartButton
          productId={product.id}
          isOutOfStock={isOutOfStock}
          className="w-full py-3 px-4 rounded-xl font-bold text-base
            transition-all duration-200 ease-in-out
            flex items-center justify-center gap-2
            transform hover:scale-[1.02] active:scale-95
            disabled:transform-none disabled:hover:scale-100
            shadow-md hover:shadow-lg"
        />
      </div>

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-blue-400/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
}
