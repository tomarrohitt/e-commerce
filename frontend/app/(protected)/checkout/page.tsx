import { OrderSummary } from "./_components/order-summary";
import { PaymentSection } from "./_components/payment-section";
import { PlaceOrderButton } from "./_components/place-order-button";
import { ShippingSection } from "./_components/shipping-section";
import { CheckoutProvider } from "@/contexts/checkout-context";
import { getCart } from "@/lib/services/cart";
import { getAddresses } from "@/lib/services/addresses-cached";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { entranceAnim } from "@/lib/constants/enter-animation";

export default async function CheckoutPage() {
  const [cart, { data: addresses }] = await Promise.all([
    getCart(),
    getAddresses(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              Secure Checkout
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <h1
            className={`text-2xl sm:text-3xl font-bold text-foreground tracking-tight ${entranceAnim} delay-100`}
          >
            Checkout
          </h1>
          <p className={`text-muted-foreground mt-1 ${entranceAnim} delay-150`}>
            Complete your order in just a few steps
          </p>
        </div>

        <CheckoutProvider defaultAddressId={addresses[0]?.id || null}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <ShippingSection addresses={addresses} />
              <PaymentSection />
            </div>

            <div className="lg:col-span-1">
              <OrderSummary cart={cart}>
                <PlaceOrderButton cart={cart} addresses={addresses} />
              </OrderSummary>
            </div>
          </div>
        </CheckoutProvider>
      </main>
    </div>
  );
}
