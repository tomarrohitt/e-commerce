"use client";
import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { cartService } from "@/lib/api";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, refreshCart } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number,
  ) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingItems((prev) => new Set(prev).add(productId));
      await cartService.updateCartItem(productId, newQuantity);
      await refreshCart();
    } catch (error: any) {
      toast.error(error.error || "Failed to update cart");
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      setUpdatingItems((prev) => new Set(prev).add(productId));
      await cartService.removeFromCart(productId);
      await refreshCart();
    } catch (error: any) {
      toast.error(error.error || "Failed to remove item");
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    try {
      await cartService.clearCart();
      await refreshCart();
    } catch (error: any) {
      toast.error(error.error || "Failed to clear cart");
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 flex space-x-4">
              <div className="w-24 h-24 bg-gray-300 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart?.items?.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added anything to your cart yet
          </p>
          <Link
            href="/products"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const hasStockIssues = cart?.items?.some(
    (item) =>
      item.product.stockQuantity === 0 ||
      item.quantity > item.product.stockQuantity,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={handleClearCart}
          className="text-red-600 hover:text-red-700 font-semibold transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart?.items?.map((item) => {
            const isUpdating = updatingItems.has(item.productId);
            const isOutOfStock = item.product.stockQuantity === 0;

            return (
              <div
                key={item.productId}
                className="bg-white rounded-xl shadow-md p-6 flex space-x-4"
              >
                <Link href={`/products/${item.productId}`} className="shrink-0">
                  <div className="w-24 h-24 bg-linear-linear-br from-purple-400 to-indigo-600 rounded-lg overflow-hidden">
                    {item?.product?.images?.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-3xl">
                        📦
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1">
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-semibold text-lg text-gray-900 hover:text-purple-600 transition-colors block mb-2"
                  >
                    {item.product.name}
                  </Link>

                  <p className="text-2xl font-bold text-purple-600 mb-4">
                    ${item.product.price.toFixed(2)}
                  </p>

                  {/* Stock Warning */}
                  {isOutOfStock ? (
                    <p className="text-red-600 font-semibold mb-3">
                      Out of stock
                    </p>
                  ) : item.quantity > item.product.stockQuantity ? (
                    <p className="text-yellow-600 font-semibold mb-3">
                      Only {item.product.stockQuantity} left in stock
                    </p>
                  ) : null}

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId,
                            item.quantity - 1,
                          )
                        }
                        disabled={isUpdating || item.quantity <= 1}
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {isUpdating ? "..." : item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.productId,
                            item.quantity + 1,
                          )
                        }
                        disabled={
                          isUpdating ||
                          item.quantity >= item.product.stockQuantity
                        }
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      disabled={isUpdating}
                      className="text-red-600 hover:text-red-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="mt-4 text-right">
                    <p className="text-sm text-gray-600">Item Total</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span>${cart.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${cart.tax}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-purple-600">
                    ${cart.totalAmount}
                  </span>
                </div>
              </div>
            </div>

            {hasStockIssues && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-semibold">
                  ⚠️ Some items are out of stock or exceed available quantity.
                  Please update your cart before checkout.
                </p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={hasStockIssues}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-3"
            >
              Proceed to Checkout
            </button>

            <Link
              href="/products"
              className="block w-full text-center text-purple-600 hover:text-purple-700 font-semibold py-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
