"use client";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/lib/api";
import CheckoutForm from "./checkout-form";
import { useMemo, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

// ✅ Validate Stripe key before initializing
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
  console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
}

// Initialize Stripe outside component with validation
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") as string;

  // ✅ ALL HOOKS MUST BE AT THE TOP - CALLED UNCONDITIONALLY
  const [stripeError, setStripeError] = useState<string | null>(null);

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrder(orderId).then((res) => res.data),
    enabled: !!orderId,
    refetchInterval: (query) => {
      const currentOrder = query.state.data;
      if (currentOrder?.paymentClientSecret) return false;
      if (
        currentOrder?.status === "PAID" ||
        currentOrder?.status === "CANCELLED"
      )
        return false;
      return 1000;
    },
    retry: 3,
  });

  // ✅ Validate Stripe configuration on mount
  useEffect(() => {
    if (!stripePromise) {
      setStripeError("Stripe is not configured. Please contact support.");
    }
  }, []);

  // ✅ Memoize options - always called, but only used when needed
  const clientSecret = order?.paymentClientSecret || "";
  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#9333ea",
        },
      },
    }),
    [clientSecret],
  );

  // ✅ NOW we can do conditional rendering AFTER all hooks are called
  if (!orderId) {
    return (
      <ErrorDisplay message="No order ID provided. Please return to checkout." />
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
          <p className="text-gray-500">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message="Failed to load order. Please try again." />;
  }

  if (!order) {
    return <ErrorDisplay message="Order not found. Please contact support." />;
  }

  if (stripeError) {
    return <ErrorDisplay message={stripeError} />;
  }

  // ✅ Validate client secret exists
  if (!clientSecret) {
    return (
      <div className="flex h-screen items-center justify-center flex-col bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800">
          Initializing Payment
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          Please wait while we secure your connection...
        </p>
      </div>
    );
  }

  // ✅ Validate client secret format (should start with pi_ or seti_)
  if (!clientSecret.startsWith("pi_") && !clientSecret.startsWith("seti_")) {
    console.error("Invalid client secret format:", clientSecret);
    return (
      <ErrorDisplay message="Invalid payment configuration. Please contact support." />
    );
  }

  if (!stripePromise) {
    return <ErrorDisplay message="Payment system unavailable." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Secure Payment</h1>
          <p className="mt-2 text-gray-600">
            Complete your purchase for Order #{order.id.slice(-6).toUpperCase()}
          </p>
        </div>

        <Elements key={clientSecret} options={options} stripe={stripePromise}>
          <CheckoutForm orderId={order.id} amount={Number(order.totalAmount)} />
        </Elements>
      </div>
    </div>
  );
}

// ✅ Reusable error display component
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <h2 className="text-xl font-bold text-gray-900">Payment Error</h2>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => (window.location.href = "/checkout")}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
        >
          Return to Checkout
        </button>
      </div>
    </div>
  );
}
