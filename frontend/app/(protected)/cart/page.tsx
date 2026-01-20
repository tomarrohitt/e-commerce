import Link from "next/link";
import { CartItem } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { getCart } from "@/lib/api";
import { ShoppingBag, ArrowRight, Package, ShoppingCart } from "lucide-react";
import { ClearCartButton } from "@/components/cart/clear-cart-button";
import { cookies } from "next/headers";

export default async function CartPage() {
  await cookies();
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
      <div className="bg-linear-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-8 mb-8 border-2 border-blue-100 shadow-sm h-35">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                Shopping Cart
                <span className="text-sm font-normal px-3 py-1 bg-blue-500 text-white rounded-full shadow-sm">
                  {cart.totalItems}
                </span>
              </h1>
              <p className="text-gray-500 flex items-center gap-2">
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
          <Card className="sticky top-0 shadow-lg border-2 border-gray-100  pt-0">
            <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50  h-18 pt-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Order Summary
              </h2>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-500">
                  <span>
                    Subtotal ({cart.totalItems}{" "}
                    {cart.totalItems === 1 ? "item" : "items"})
                  </span>
                  <span className="font-semibold">
                    ${formatPrice(cart.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-green-500 font-semibold flex items-center gap-1">
                    <span className="text-lg">✓</span> FREE
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
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
                    <span className="text-2xl font-bold text-blue-500">
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

              <Link
                href={`/checkout`}
                className="w-full mb-3 group shadow-md hover:shadow-lg transition-all flex items-center justify-center"
              >
                <Button className="w-full">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/products">
                <Button
                  variant="ghost"
                  className="w-full hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-green-500">🔒</span>
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

export function EmptyCartState() {
  return (
    <div className="flex-1 bg-muted/30 flex flex-col pt-30 items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-lg w-full mb-12">
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <ShoppingCart
              className="w-16 h-16 text-primary"
              strokeWidth={1.5}
            />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-16 -translate-y-2 w-4 h-4 bg-primary/20 rounded-full animate-pulse" />
          <div className="absolute bottom-4 right-1/2 translate-x-20 w-3 h-3 bg-primary/30 rounded-full animate-pulse delay-150" />
          <div className="absolute top-8 right-1/2 translate-x-24 w-2 h-2 bg-primary/40 rounded-full animate-pulse delay-300" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">
          Your Cart is Empty
        </h1>
        <p className="text-muted-foreground text-lg mb-8 text-pretty">
          Looks like you haven't found anything you love yet. Let's change that!
        </p>

        <Link href="/products">
          <Button
            size="lg"
            className="group shadow-md hover:shadow-lg transition-all"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Start Shopping
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
