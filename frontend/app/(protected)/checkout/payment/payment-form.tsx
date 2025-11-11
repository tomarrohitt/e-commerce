"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import toast from "react-hot-toast";

interface PaymentFormProps {
  orderId: string;
}

export default function PaymentForm({ orderId }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);

    // This is where you finalize the payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // This is the page Stripe will redirect to after payment
        return_url: `${window.location.origin}/orders/${orderId}/success?payment_success=true`,
      },
    });

    // This point will only be reached if there's an immediate error.
    // Otherwise, the user is redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      toast.error(error.message || "An unexpected error occurred.");
    } else {
      toast.error("An unexpected error occurred.");
    }

    setIsProcessing(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button
        disabled={isProcessing || !stripe || !elements}
        id="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
      >
        <span id="button-text">
          {isProcessing ? "Processing..." : "Pay Now"}
        </span>
      </button>
    </form>
  );
}
