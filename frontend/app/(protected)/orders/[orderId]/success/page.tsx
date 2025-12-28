"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { orderService } from "@/lib/api";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string; // e.g., "PENDING", "SHIPPED", "DELIVERED"
  paymentStatus: string; // e.g., "PENDING", "PAID"
  stripePaymentIntentId: string;
  shippingAddress: ShippingAddress;
  orderItems: OrderItem[];
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.orderId as string;
  const redirectStatus = searchParams.get("redirect_status");
  const paymentSuccess = searchParams.get("payment_success");

  useEffect(() => {
    if (orderId) {
      // Fetch the order from your backend to show details
      const fetchOrder = async () => {
        try {
          // This call will tell you if the webhook worked
          const response = await orderService.getOrder(orderId);
          setOrder(response.order);
        } catch (err: any) {
          setError(err.error || "Failed to load order details.");
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [orderId]);

  const renderStatus = () => {
    if (redirectStatus === "succeeded" || paymentSuccess === "true") {
      return (
        <>
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-white" // <-- Fix: Changed 'className' to 'class'
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-6">Thank You!</h1>
          <p className="text-lg text-gray-700 mt-2">
            Your payment was successful.
          </p>

          {/* Show loading state for the order fetch */}
          {loading && (
            <p className="text-gray-600 mt-4 animate-pulse">
              Syncing order details...
            </p>
          )}

          {/* Show error if order fetch fails */}
          {error && (
            <p className="text-red-600 mt-4">
              Could not sync your order details. Please check your account page
              for the order.
            </p>
          )}

          {/* Show order details once loaded */}
          {!loading && order && (
            <>
              <p className="text-gray-600 mt-4">
                Your order ID is:{" "}
                <span className="font-semibold text-gray-900">{order.id}</span>
              </p>
              <p className="text-gray-600">
                Order Status:{" "}
                <span className="font-semibold text-gray-900">
                  {order.status}
                </span>
              </p>
              <p>
                Payment status:{" "}
                <span
                  className={`font-bold text-lg uppercase ${
                    order.stripePaymentIntentId
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {" "}
                  {order.stripePaymentIntentId ? "PAID" : "PENDING"}
                </span>
              </p>
              {order.paymentStatus === "PENDING" && (
                <p className="text-sm text-blue-600 mt-2 animate-pulse">
                  (We are confirming your payment with the bank. This may take a
                  moment. You can safely refresh.)
                </p>
              )}
            </>
          )}
        </>
      );
    }

    // Case 2: Still loading, and we don't know the status
    if (loading) {
      return (
        <>
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-gray-700 mt-4">Loading order...</p>
        </>
      );
    }

    // Case 3: Error fetching order (and not a success redirect)
    if (error) {
      return <p className="text-lg text-red-600">{error}</p>;
    }

    // Case 4: Payment failed or was canceled
    return (
      <p className="text-lg text-red-600">Payment failed or was canceled.</p>
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <div className="bg-white p-8 rounded-xl shadow-md">
        {renderStatus()}
        <Link
          href="/"
          className="inline-block mt-8 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
