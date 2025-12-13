// src/app/products/[id]/ProductDetailsClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cartService } from "@/lib/api";
import type { Product } from "@/types";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context"; // Import useCart

// 1. We receive the product as a prop
export default function ProductDetailsClient({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      router.push(`/sign-in?redirect=/products/${product.id}`);
      return;
    }

    try {
      setAddingToCart(true);
      await cartService.addToCart(product.id, quantity);
      await refreshCart();
      toast.success("Added to cart!");
      setQuantity(1);
    } catch (error: any) {
      toast.error(error.error || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to purchase");
      router.push(`/sign-in?redirect=/products/${product.id}`);
      return;
    }

    try {
      setAddingToCart(true);
      await cartService.addToCart(product.id, quantity);
      await refreshCart();
      toast.success("Added to cart!");
      setAddingToCart(false);
      router.push("/checkout");
    } catch (error: any) {
      toast.error(error.error || "Failed to add to cart");
      setAddingToCart(false);
    }
  };

  // 7. No need for loading or "if (!product)" checks, it's guaranteed
  const isOutOfStock = product.stockQuantity === 0;
  const maxQuantity = Math.min(product.stockQuantity, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex mb-8 text-sm">
        <Link href="/" className="text-gray-500 hover:text-purple-600">
          Home
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link href="/products" className="text-gray-500 hover:text-purple-600">
          Products
        </Link>
        {product.category && (
          <>
            <span className="mx-2 text-gray-400">/</span>
            {/* 8. Fixed this to use the slug, matching our other page */}
            <Link
              href={`/?category=${product.category.slug}`}
              className="text-gray-500 hover:text-purple-600"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images Section */}
        <div>
          {/* Main Image */}
          <div className="aspect-square bg-linear-to-br from-purple-400 to-indigo-600 rounded-2xl overflow-hidden mb-4">
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-9xl">📦</span>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-purple-600 scale-105"
                      : "border-gray-200 hover:border-purple-400"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div>
          {/* Category Badge */}
          {product.category && (
            <Link
              href={`/?category=${product.category.slug}`}
              className="inline-block bg-purple-100 text-purple-600 px-4 py-1 rounded-full text-sm font-semibold mb-4 hover:bg-purple-200 transition-colors"
            >
              {product.category.name}
            </Link>
          )}

          {/* Product Name */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* ... (Rest of the JSX is IDENTICAL to your file) ... */}
          {/* Price */}
          <div className="flex items-baseline space-x-4 mb-6">
            <span className="text-4xl font-bold text-purple-600">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-lg text-gray-500">SKU: {product.sku}</span>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {isOutOfStock ? (
              <span className="inline-block bg-red-100 text-red-600 px-4 py-2 rounded-lg font-semibold">
                Out of Stock
              </span>
            ) : product.stockQuantity <= 5 ? (
              <span className="inline-block bg-yellow-100 text-yellow-600 px-4 py-2 rounded-lg font-semibold">
                Only {product.stockQuantity} left in stock!
              </span>
            ) : (
              <span className="inline-block bg-green-100 text-green-600 px-4 py-2 rounded-lg font-semibold">
                In Stock ({product.stockQuantity} available)
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Description
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {product.description || "No description available."}
            </p>
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center font-semibold"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= maxQuantity) {
                      setQuantity(val);
                    }
                  }}
                  className="w-20 h-10 text-center border-2 border-gray-300 rounded-lg font-semibold focus:border-purple-600 focus:outline-none"
                />
                <button
                  onClick={() =>
                    setQuantity(Math.min(maxQuantity, quantity + 1))
                  }
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center font-semibold"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">
                  (Max: {maxQuantity})
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-[1.02]"
              }`}
            >
              {addingToCart ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </span>
              ) : isOutOfStock ? (
                "Out of Stock"
              ) : (
                "🛒 Add to Cart"
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || addingToCart}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-[1.02]"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "⚡ Buy Now"}
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 border-t border-gray-200 pt-6 space-y-4">
            {/* ... (rest of the info links) ... */}
          </div>
        </div>
      </div>
    </div>
  );
}
