"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./payment-form";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

console.log(
  "Stripe is loading with key:",
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const secret = searchParams.get("clientSecret");
    const id = searchParams.get("orderId");
    if (secret) {
      setClientSecret(secret);
    }
    if (id) {
      setOrderId(id);
    }
  }, [searchParams]);

  if (!clientSecret || !orderId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold">Invalid Payment Session</p>
          <p className="text-gray-600">Please try checking out again.</p>
        </div>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
    },
  };

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Complete Your Payment
      </h1>
      <Elements options={options} stripe={stripePromise}>
        <PaymentForm orderId={orderId} />
      </Elements>
    </div>
  );
}
