import { useState, FormEvent, useMemo, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { AlertCircle, CheckCircle, Lock, RefreshCw } from "lucide-react";

interface CheckoutFormProps {
  orderId: string;
  amount: string;
}

export default function CheckoutForm({ orderId, amount }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("CheckoutForm mounted", {
      stripe: !!stripe,
      elements: !!elements,
    });
  }, []);

  useEffect(() => {
    console.log("Stripe initialized:", !!stripe);
  }, [stripe]);

  useEffect(() => {
    console.log("Elements initialized:", !!elements);
  }, [elements]);

  const paymentElementOptions = useMemo(
    () => ({
      layout: "tabs" as const,
    }),
    [],
  );

  const handleReload = () => {
    setLoadError(null);
    setMessage(null);
    window.location.reload();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("Payment system not initialized. Please refresh the page.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}?payment_status=success`,
        },
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message || "An unexpected error occurred.");
        } else {
          setMessage("An unexpected error occurred. Please try again.");
        }
      }
    } catch (e) {
      console.error("Payment error:", e);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show error state if PaymentElement failed to load
  if (loadError) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex items-start gap-3 mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">
              Payment Form Failed to Load
            </h3>
            <p className="text-sm text-red-700 mb-3">{loadError}</p>
            <button
              onClick={handleReload}
              className="flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Payment Form
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            Troubleshooting Steps:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Check your internet connection</li>
            <li>Disable any ad blockers or VPN</li>
            <li>Try a different browser or incognito mode</li>
            <li>Contact support if the issue persists</li>
          </ul>
        </div>

        <button
          onClick={() => (window.location.href = "/checkout")}
          className="w-full mt-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
        >
          Return to Checkout
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-6 sm:p-8"
    >
      <div className="mb-6 pb-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 font-medium">Total due</span>
          <span className="text-2xl font-bold text-gray-900">${amount}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
          <CheckCircle className="w-3 h-3" />
          <span>Secure SSL Connection</span>
        </div>
      </div>

      <div className="mb-6">
        {/* Show loading spinner while PaymentElement initializes */}
        {!isReady && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600 text-sm">Loading payment form...</p>
            <p className="text-gray-400 text-xs mt-2">
              This may take a few seconds
            </p>
          </div>
        )}

        <div style={{ display: isReady ? "block" : "none" }}>
          <PaymentElement
            id="payment-element"
            options={paymentElementOptions}
            onReady={() => {
              console.log("PaymentElement ready!");
              setIsReady(true);
              setLoadError(null);
            }}
            onLoadError={(error) => {
              console.error("PaymentElement load error:", error);
              setLoadError(
                "Failed to load payment form. Please check your connection and try again.",
              );
              setIsReady(false);
            }}
            onChange={(event) => {
              console.log("PaymentElement changed:", event);
              if (event.complete) {
                setMessage(null);
              }
            }}
          />
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700">{message}</div>
        </div>
      )}

      <button
        disabled={!isReady || isLoading || !stripe || !elements}
        id="submit"
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>Pay ${amount}</span>
          </>
        )}
      </button>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
          Payments processed securely by Stripe
        </p>
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs space-y-1">
          <p>Debug Info:</p>
          <p>Stripe: {stripe ? "✓" : "✗"}</p>
          <p>Elements: {elements ? "✓" : "✗"}</p>
          <p>Ready: {isReady ? "✓" : "✗"}</p>
        </div>
      )}
    </form>
  );
}
