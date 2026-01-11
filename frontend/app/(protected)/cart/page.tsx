import Link from "next/link";
import { CartItem } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { getCart } from "@/lib/api";
import { ShoppingBag, ArrowRight, Package, Trash2 } from "lucide-react";
import { ClearCartButton } from "@/components/cart/clear-cart-button";

export default async function CartPage() {
  const cart = await getCart();

  if (!cart.items || cart.items.length === 0) {
    return <EmptyCartState />;
  }

  const hasOutOfStock = cart.items.some(
    (item) => item.product.stockQuantity === 0,
  );
  const hasExceedsStock = cart.items.some(
    (item) => item.quantity > item.product.stockQuantity,
  );
  const hasIssues = hasOutOfStock || hasExceedsStock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-linear-to-r from-purple-50 via-indigo-50 to-purple-50 rounded-2xl p-8 mb-8 border-2 border-purple-100 shadow-sm h-35">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                Shopping Cart
                <span className="text-sm font-normal px-3 py-1 bg-purple-600 text-white rounded-full shadow-sm">
                  {cart.totalItems}
                </span>
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {cart.totalItems} {cart.totalItems === 1 ? "item" : "items"}{" "}
                ready for checkout
              </p>
            </div>
          </div>
          <ClearCartButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItem key={item.productId} item={item} isUpdating={false} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-lg border-2 border-gray-100">
            <CardHeader className="bg-linear-to-r from-purple-50 to-indigo-50  h-18">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Order Summary
              </h2>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal ({cart.totalItems}{" "}
                    {cart.totalItems === 1 ? "item" : "items"})
                  </span>
                  <span className="font-semibold">
                    ${formatPrice(cart.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <span className="text-lg">✓</span> FREE
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-semibold">
                    ${formatPrice(cart.tax)}
                  </span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-purple-600">
                      ${formatPrice(cart.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {hasIssues && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 text-lg mt-0.5">⚠️</span>
                    <p className="text-sm text-red-700 font-medium">
                      Some items are out of stock or exceed available quantity.
                      Please update your cart before checkout.
                    </p>
                  </div>
                </div>
              )}

              <Button
                className="w-full mb-3 group shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                disabled={hasIssues}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Link href="/products">
                <Button
                  variant="ghost"
                  className="w-full hover:bg-purple-50 transition-colors flex items-center justify-center"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-600">🔒</span>
                  <span>Secure checkout guaranteed</span>
                </div>
              </div>
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
      <Card className="p-12 text-center shadow-lg">
        <div className="text-6xl mb-4 animate-in zoom-in-50 duration-500">
          🛒
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-gray-600 mb-6">
          Looks like you haven't added anything to your cart yet
        </p>
        <Link href="/products" className="flex justify-center">
          <Button className="group shadow-md hover:shadow-lg transition-all flex items-center ">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Start Shopping
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}
