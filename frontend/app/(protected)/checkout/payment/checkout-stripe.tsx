"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo, useEffect } from "react";
import CheckoutForm from "./checkout-form";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export const CheckoutStripe = ({
  orderId,
  amount,
  clientSecret,
}: {
  orderId: string;
  amount: string;
  clientSecret: string;
}) => {
  // Debug logging
  useEffect(() => {
    console.log("CheckoutStripe mounted with:", {
      orderId,
      amount,
      clientSecret: clientSecret
        ? `${clientSecret.substring(0, 20)}...`
        : "missing",
      stripeKey: stripeKey ? `${stripeKey.substring(0, 20)}...` : "missing",
    });
  }, [orderId, amount, clientSecret]);

  const stripePromise = useMemo(() => {
    console.log("Creating Stripe promise...");

    if (!stripeKey) {
      console.error("❌ STRIPE KEY IS MISSING!");
      console.error(
        "Make sure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set in your .env.local",
      );
      return null;
    }

    if (!stripeKey.startsWith("pk_")) {
      console.error("❌ INVALID STRIPE KEY FORMAT!");
      console.error("Key should start with 'pk_test_' or 'pk_live_'");
      return null;
    }

    console.log("✓ Stripe key found, loading Stripe...");
    return loadStripe(stripeKey);
  }, []);

  // Check for missing Stripe key
  if (!stripeKey) {
    console.error("Rendering error: No Stripe key");
    return (
      <div>
        Stripe is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        to your environment variables.
      </div>
    );
  }

  // Check for invalid Stripe key format
  if (!stripeKey.startsWith("pk_")) {
    console.error("Rendering error: Invalid Stripe key format");
    return (
      <div>
        Invalid Stripe configuration. The publishable key should start with
        'pk_test_' or 'pk_live_'.
      </div>
    );
  }

  if (!stripePromise) {
    console.error("Rendering error: No Stripe promise");
    return <div>Failed to initialize Stripe. Please contact support.</div>;
  }

  // Validate client secret
  if (!clientSecret || typeof clientSecret !== "string") {
    console.error("Invalid client secret:", clientSecret);
    return <div>Invalid payment session. Please try again.</div>;
  }

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

  console.log("Rendering Elements component with options:", {
    hasClientSecret: !!clientSecret,
    hasStripePromise: !!stripePromise,
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold mb-2">Secure Payment</h1>
        <p className="text-gray-600 text-sm">
          Order #{orderId.slice(-6).toUpperCase()}
        </p>
      </div>

      <Elements stripe={stripePromise} options={options}>
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-purple-50 border-purple-200">
            <div className="shrink-0">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <span className="font-medium text-gray-900">Pay with Stripe</span>
          </div>

          <CheckoutForm orderId={orderId} amount={amount} />
        </div>
      </Elements>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-6 p-3 bg-gray-100 rounded text-xs space-y-1">
          <p className="font-semibold">Debug Info:</p>
          <p>Stripe Key: {stripeKey ? "✓ Present" : "✗ Missing"}</p>
          <p>Client Secret: {clientSecret ? "✓ Present" : "✗ Missing"}</p>
          <p>Order ID: {orderId}</p>
          <p>Amount: ${amount}</p>
        </div>
      )}
    </div>
  );
};
