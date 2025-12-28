"use client";

import { useState, useCallback } from "react";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { cartService } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Product } from "@/types";

// ✅ Only the interactive parts are client-side
export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const maxQuantity = Math.min(10, product.stockQuantity);

  // ✅ Memoized callback
  const handleAddToCart = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      router.push(`/sign-in?redirect=/products/${product.id}`);
      return;
    }

    try {
      setAddingToCart(true);
      await cartService.addToCart(product.id, quantity);

      // ✅ Only refresh cart, not entire page
      await refreshCart();
      toast.success("Added to cart!");
      setQuantity(1);
    } catch (error: any) {
      toast.error(error.error || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  }, [isAuthenticated, product.id, quantity, router, refreshCart]);

  return (
    <div className="space-y-6">
      {product.category && (
        <span className="inline-block bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-semibold">
          {product.category.name}
        </span>
      )}

      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
        {product.name}
      </h1>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < Math.floor(product.rating || 0)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-semibold">{product.rating}</span>
        <span className="text-gray-500">({product.reviewCount} reviews)</span>
      </div>

      <div className="flex items-baseline space-x-4">
        <span className="text-4xl font-bold text-purple-600">
          ${Number(product.price).toFixed(2)}
        </span>
        <span className="text-lg text-gray-500 line-through">
          ${(Number(product.price) * 1.25).toFixed(2)}
        </span>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
          25% OFF
        </span>
      </div>

      {/* Interactive controls */}
      <div className="pt-6 border-t space-y-6">
        <div className="flex items-center space-x-4">
          {/* Quantity selector */}
          <div className="flex items-center border-2 border-gray-200 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 flex items-center justify-center hover:bg-gray-50"
            >
              -
            </button>
            <span className="w-12 text-center font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              className="w-12 h-12 flex items-center justify-center hover:bg-gray-50"
            >
              +
            </button>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0 || addingToCart}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {addingToCart ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </>
            )}
          </button>

          {/* Wishlist button */}
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`p-4 rounded-xl border-2 transition-all ${
              isWishlisted
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-gray-200 hover:border-purple-300 text-gray-400"
            }`}
          >
            <Heart
              className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Description (server-rendered in real version) */}
      <div className="pt-6 border-t">
        <p className="text-gray-700 leading-relaxed">{product.description}</p>
      </div>
    </div>
  );
}
