import { useState, FormEvent, useMemo } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { AlertCircle, Lock, RefreshCw, ShieldCheck } from "lucide-react";

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
          return_url: `${window.location.origin}/orders/${orderId}/success`,
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

  if (loadError) {
    return (
      <div>
        <div className="flex items-start gap-3 mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-6 h-6 text-red-500 mt-0.5 shrink-0" />
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

        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-medium text-gray-900 mb-3">
            Troubleshooting Steps:
          </h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Check your internet connection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Disable any ad blockers or VPN</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Try a different browser or incognito mode</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Contact support if the issue persists</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => (window.location.href = "/checkout")}
          className="w-full mt-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all"
        >
          Return to Checkout
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-xl w-fit mb-4">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-medium">Secure SSL Connection</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-gray-600 font-medium">Amount to pay</span>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">${amount}</div>
            <div className="text-sm text-gray-500">USD</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        {!isReady && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4 font-medium">
              Loading secure payment form...
            </p>
            <p className="text-gray-400 text-xs mt-1">
              This may take a few seconds
            </p>
          </div>
        )}

        <div style={{ display: isReady ? "block" : "none" }}>
          <PaymentElement
            id="payment-element"
            options={paymentElementOptions}
            onReady={() => {
              setIsReady(true);
              setLoadError(null);
            }}
            onLoadError={(error: any) => {
              console.error("PaymentElement load error:", error);
              console.error("Error details:", JSON.stringify(error, null, 2));
              console.error("Error type:", error?.type);
              console.error("Error message:", error?.message);

              let errorMessage = "Failed to load payment form. ";

              if (error?.message) {
                errorMessage += error.message;
              } else {
                errorMessage += "Please check your connection and try again.";
              }

              setLoadError(errorMessage);
              setIsReady(false);
            }}
            onChange={(event) => {
              if (event.complete) {
                setMessage(null);
              }
            }}
          />
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700 flex-1">{message}</div>
        </div>
      )}

      <button
        disabled={!isReady || isLoading || !stripe || !elements}
        id="submit"
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2 text-lg"
      >
        {isLoading ? (
          <>
            <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing payment...</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Pay ${amount} securely</span>
          </>
        )}
      </button>

      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          <span>256-bit encryption</span>
        </div>
        <div className="w-1 h-1 bg-gray-300 rounded-full" />
        <div className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          <span>PCI DSS compliant</span>
        </div>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs space-y-1 font-mono">
          <p className="font-semibold text-gray-700">Debug Info:</p>
          <p className="text-gray-600">Stripe: {stripe ? "✓" : "✗"}</p>
          <p className="text-gray-600">Elements: {elements ? "✓" : "✗"}</p>
          <p className="text-gray-600">Ready: {isReady ? "✓" : "✗"}</p>
        </div>
      )}
    </form>
  );
}
