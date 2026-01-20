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
  useEffect(() => {
    // Validate client secret format
    if (clientSecret) {
      const isValid =
        clientSecret.startsWith("pi_") || clientSecret.startsWith("seti_");
    }
  }, [orderId, amount, clientSecret]);

  const stripePromise = useMemo(() => {
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
    return loadStripe(stripeKey);
  }, []);

  if (!stripeKey) {
    console.error("Rendering error: No Stripe key");
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-red-600">⚠️</span>
          </div>
          <div>
            <h3 className="font-semibold text-red-900 mb-1">
              Configuration Error
            </h3>
            <p className="text-sm text-red-700">
              Stripe is not configured. Please add
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!stripeKey.startsWith("pk_")) {
    console.error("Rendering error: Invalid Stripe key format");
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-red-600">⚠️</span>
          </div>
          <div>
            <h3 className="font-semibold text-red-900 mb-1">
              Configuration Error
            </h3>
            <p className="text-sm text-red-700">
              Invalid Stripe configuration. The publishable key should start
              with 'pk_test_' or 'pk_live_'.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    console.error("Rendering error: No Stripe promise");
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-red-600">❌</span>
          </div>
          <div>
            <h3 className="font-semibold text-red-900 mb-1">
              Initialization Failed
            </h3>
            <p className="text-sm text-red-700">
              Failed to initialize Stripe. Please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret || typeof clientSecret !== "string") {
    console.error("Invalid client secret:", clientSecret);
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-red-600">⚠️</span>
          </div>
          <div>
            <h3 className="font-semibold text-red-900 mb-1">
              Payment Session Error
            </h3>
            <p className="text-sm text-red-700">
              Invalid payment session. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#2563eb",
          colorBackground: "#ffffff",
          colorText: "#1f2937",
          colorDanger: "#ef4444",
          fontFamily: "system-ui, sans-serif",
          spacingUnit: "4px",
          borderRadius: "12px",
        },
      },
    }),
    [clientSecret],
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm orderId={orderId} amount={amount} />
      </Elements>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs space-y-1 font-mono">
          <p className="font-semibold text-gray-700">Debug Info:</p>
          <p className="text-gray-600">
            Stripe Key: {stripeKey ? "✓ Present" : "✗ Missing"}
          </p>
          <p className="text-gray-600">
            Client Secret: {clientSecret ? "✓ Present" : "✗ Missing"}
          </p>
          <p className="text-gray-600">Order ID: {orderId}</p>
          <p className="text-gray-600">Amount: ${amount}</p>
        </div>
      )}
    </div>
  );
};
