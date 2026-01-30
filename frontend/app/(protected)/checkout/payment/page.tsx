import Link from "next/link";
import { CheckoutStripe } from "./_components/checkout-stripe";
import { Package, MapPin, CreditCard, ShieldCheck } from "lucide-react";
import { PaymentPendingPoller } from "./_components/payment-pending-poller";
import { getOrder } from "@/lib/services/orders";
import Image from "next/image";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-linear-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">
            Missing Order ID
          </h2>
          <p className="text-gray-500 mb-6">No order ID provided.</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  let order = await getOrder(orderId);

  let attempts = 0;
  const maxAttempts = 5;

  while (order && !order.paymentClientSecret && attempts < maxAttempts) {
    await sleep(500);
    order = await getOrder(orderId);
    attempts++;
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-linear-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">
            Order Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            We couldn&apos;t locate this order.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const clientSecret = order?.paymentClientSecret;

  if (!clientSecret) {
    return <PaymentPendingPoller />;
  }

  if (!clientSecret.startsWith("pi_") && !clientSecret.startsWith("seti_")) {
    console.error("Invalid client secret format:", clientSecret);
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-linear-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">
            Payment Error
          </h2>
          <p className="text-gray-500 mb-6">
            Invalid payment configuration. Please contact support.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 py-8 px-4 sm:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <ShieldCheck className="w-4 h-4" />
            Secure Checkout
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-500">Order #{order.id.toUpperCase()}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Order Summary - Server Component */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Items
                </h2>
              </div>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted ring-1 ring-border">
                      <Image
                        src={item.thumbnail}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        ${item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Shipping Address
                </h2>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.name}
                </p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2">{order.shippingAddress.phoneNumber}</p>
              </div>
            </div>

            {/* Order Total */}
            <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
              <div className="space-y-3">
                <div className="flex justify-between text-blue-100">
                  <span>Subtotal</span>
                  <span>${order.subtotal}</span>
                </div>
                <div className="flex justify-between text-blue-100">
                  <span>Tax</span>
                  <span>${order.tax}</span>
                </div>
                <div className="border-t border-blue-400 pt-3 flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold">
                    ${order.totalAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form - Client Component */}
          <div className="lg:col-span-3">
            <CheckoutStripe
              orderId={order.id}
              amount={order.totalAmount}
              clientSecret={clientSecret}
            />
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#635bff" />
              <path d="M2 17L12 22L22 17" stroke="#635bff" strokeWidth="2" />
              <path d="M2 12L12 17L22 12" stroke="#635bff" strokeWidth="2" />
            </svg>
            <span>Powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
