import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";

export type CartItem = {
  productId: string;
  quantity: number;
  addedAt: Date;
};

export interface CartItemWithProduct extends CartItem {
  product: {
    productId: string;
    name: string;
    price: number;
    thumbnail: string;
    stockQuantity: number;
    sku: string;
  };
}

export interface Cart {
  items: CartItemWithProduct[];
  totalItems: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
}
interface OrderSummaryProps {
  cart: Cart;
  onCheckout: () => void;
  isSubmitting: boolean;
  canCheckout: boolean;
}

export function OrderSummary({
  cart,
  onCheckout,
  isSubmitting,
  canCheckout,
}: OrderSummaryProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {cart.items.map((item) => (
            <OrderItem key={item.productId} item={item} />
          ))}
        </div>
        <PriceBreakdown cart={cart} />
        <Button
          onClick={onCheckout}
          disabled={!canCheckout || isSubmitting}
          className="w-full mb-3"
          isLoading={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Place Order"}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          By placing your order, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </CardContent>
    </Card>
  );
}

function OrderItem({ item }: { item: any }) {
  return (
    <div className="flex space-x-3">
      <div className="w-16 h-16 bg-linear-to-br from-purple-400 to-indigo-600 rounded-lg overflow-hidden shrink-0">
        {item.product.thumbnail ? (
          <img
            src={item.product.thumbnail}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-xl">
            📦
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">
          {item.product.name}
        </p>
        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
        <p className="text-sm font-semibold text-purple-600">
          ${(item.product.price * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

function PriceBreakdown({ cart }: { cart: Cart }) {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span>${cart.subtotal}</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Shipping</span>
        <span className="text-green-600">FREE</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Tax (18%)</span>
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
  );
}
