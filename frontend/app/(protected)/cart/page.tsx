"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { CartItem } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { SkeletonTable } from "@/components/ui/skeleton";
import { useCartActions } from "@/hooks/use-cart-action";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const router = useRouter();
  const { cart, loading } = useCart();
  const { updateQuantity, removeItem, clearCart, isUpdating } =
    useCartActions();

  if (loading) {
    return <CartPageSkeleton />;
  }

  if (!cart || cart.items.length === 0) {
    return <EmptyCartState />;
  }

  const hasStockIssues = cart.items.some(
    (item) =>
      item.product.stockQuantity === 0 ||
      item.quantity > item.product.stockQuantity,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <Button variant="danger" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              isUpdating={isUpdating(item.productId)}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.totalItems} items)</span>
                  <span>${formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${formatPrice(cart.tax)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-purple-600">
                      ${formatPrice(cart.totalAmount)}
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

              <Button
                onClick={() => router.push("/checkout")}
                disabled={hasStockIssues}
                className="w-full mb-3"
              >
                Proceed to Checkout
              </Button>

              <Link href="/products">
                <Button variant="ghost" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EmptyCartState() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="p-12 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-gray-600 mb-6">
          Looks like you haven't added anything to your cart yet
        </p>
        <Link href="/products">
          <Button>Start Shopping</Button>
        </Link>
      </Card>
    </div>
  );
}

function CartPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <SkeletonTable rows={3} />
    </div>
  );
}
