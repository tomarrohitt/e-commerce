import type React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import type { Cart, CartItemWithProduct } from "@/types";
import Image from "next/image";

interface OrderSummaryProps {
  cart: Cart;
  children: React.ReactNode;
}
export function OrderSummary({ children, cart }: OrderSummaryProps) {
  return (
    <Card className="border-0 shadow-sm overflow-hidden sticky top-24">
      <CardHeader className="border-b bg-muted/30 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Order Summary
            </h2>
            <p className="text-sm text-muted-foreground">
              {cart.totalItems} items
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4 max-h-72 overflow-y-auto pr-1 mb-5">
          {cart.items.map((item) => (
            <OrderItem key={item.productId} item={item} />
          ))}
        </div>
        <Separator className="my-5" />
        <PriceBreakdown cart={cart} />
        {children}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure checkout powered by Stripe</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            By placing your order, you agree to our Terms of Service and Privacy
            Policy
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderItem({ item }: { item: CartItemWithProduct }) {
  return (
    <div className="flex gap-4 group">
      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted ring-1 ring-border">
        {item.product.thumbnail ? (
          <Image
            src={item.product.thumbnail || "/placeholder.svg"}
            alt={item.product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <p className="font-medium text-foreground truncate">
            {item.product.name}
          </p>
          <Badge variant="secondary" className="mt-1 text-xs">
            Qty: {item.quantity}
          </Badge>
        </div>
        <p className="text-sm font-semibold text-foreground">
          ${item.product.price * item.quantity}
        </p>
      </div>
    </div>
  );
}

function PriceBreakdown({ cart }: { cart: Cart }) {
  return (
    <div className="space-y-3 mb-5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium text-foreground">${cart.subtotal}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground flex items-center gap-1.5">
          <Truck className="w-4 h-4" />
          Shipping
        </span>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-0 font-medium"
        >
          FREE
        </Badge>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Tax (18%)</span>
        <span className="font-medium text-foreground">${cart.tax}</span>
      </div>
      <Separator />
      <div className="flex justify-between items-baseline pt-1">
        <span className="text-base font-semibold text-foreground">Total</span>
        <span className="text-2xl font-bold text-foreground">
          ${cart.totalAmount.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
