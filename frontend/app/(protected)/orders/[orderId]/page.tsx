"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/lib/api";
import { useState } from "react";

// --- Types (Kept same as your API) ---
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  sku: string;
  price: string;
  thumbnail: string;
  quantity: number;
}

export interface ShippingAddress {
  id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subtotal: string;
  tax: string;
  totalAmount: string;
  status: string; // e.g. "AWAITING_PAYMENT", "PAID", "COMPLETED"
  currency: string;
  paymentId: string | null;
  paymentClientSecret: string | null;
  invoiceUrl: string | null;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

const fetchOrderById = async (orderId: string): Promise<Order> => {
  const response = await orderService.getOrder(orderId);
  return response.data;
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: !!orderId,
  });

  const handlePayNow = () => {
    setIsRedirecting(true);

    router.push(`/checkout/payment?orderId=${orderId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "AWAITING_PAYMENT":
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const paid = order?.status === "PAID";

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
        <p className="text-gray-600 mt-2 mb-8">
          {error instanceof Error
            ? error.message
            : "We couldn't locate this order."}
        </p>
        <Link
          href="/"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.id.toUpperCase()}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}
              >
                {order.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <Link
            href="/orders"
            className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline"
          >
            &larr; Back to Orders
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item.id} className="p-6 flex gap-4 sm:gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          SKU: {item.sku}
                        </p>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                        <p className="font-semibold text-gray-900">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Shipping Address
              </h2>
              <div className="flex items-start gap-3 text-gray-600">
                <span className="mt-1 text-xl">📍</span>
                <address className="not-italic">
                  <span className="block text-gray-900 font-medium">
                    {order.userName}
                  </span>
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                  <br />
                  {order.shippingAddress.country}
                  {order.shippingAddress.phoneNumber && (
                    <span className="block mt-2 text-sm text-gray-500">
                      📞 {order.shippingAddress.phoneNumber}
                    </span>
                  )}
                </address>
              </div>
            </div>
          </div>

          {/* Right Column: Summary & Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${Number(order.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-purple-600">
                    ${Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Section */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Payment Status
                </h3>

                {paid ? (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Payment Successful
                      </p>
                      <p className="text-xs text-green-700">
                        via Stripe • {order.paymentId?.slice(0, 10)}...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                    <p className="text-sm text-orange-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      Payment Pending
                    </p>
                    <button
                      onClick={handlePayNow}
                      disabled={isRedirecting}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold shadow-sm transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isRedirecting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Redirecting...
                        </span>
                      ) : (
                        "Complete Payment"
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Help Section */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  Need help with this order?{" "}
                  <a
                    href="/support"
                    className="text-purple-600 hover:underline"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
