import { getToken } from "@/lib/get-auth";
import { getOrderById } from "@/lib/api/orders";
import Link from "next/link";
import { ErrorDisplay } from "./error-display";
import { CheckoutStripe } from "./checkout-stripe";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = (await searchParams).orderId;

  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">⚠️ Missing Order ID</h2>
          <p className="text-gray-600 mb-4">No order ID provided.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const token = await getToken();

  if (!token) {
    return <ErrorDisplay message="Authentication required. Please log in." />;
  }

  const order = await getOrderById(token, orderId);

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">⚠️ Order Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't locate this order.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const clientSecret = order?.paymentClientSecret;

  if (!clientSecret) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Initializing Payment</h2>
          <p className="text-gray-600">
            Please wait while we secure your connection...
          </p>
        </div>
      </div>
    );
  }

  if (!clientSecret.startsWith("pi_") && !clientSecret.startsWith("seti_")) {
    console.error("Invalid client secret format:", clientSecret);
    return (
      <ErrorDisplay message="Invalid payment configuration. Please contact support." />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-2">Secure Payment</h1>
          <p className="text-gray-600 mb-6">
            Complete your purchase for Order #{order.id.slice(-6).toUpperCase()}
          </p>
          <CheckoutStripe
            orderId={order.id}
            amount={order.total || "0"}
            clientSecret={clientSecret}
          />
        </div>
      </div>
    </div>
  );
}
