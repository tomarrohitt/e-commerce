"use client";

import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/lib/api";
import CheckoutForm from "./payment-form";

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
  status: string;
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

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: !!orderId,

    // ✅ 1. ADD THIS: Polling Logic
    // This tells React Query: "If the secret is missing, try again every 1s"
    refetchInterval: (query) => {
      const currentOrder = query.state.data;

      // Stop polling if we finally got the secret!
      if (currentOrder?.paymentClientSecret) return false;

      // Stop polling if order is already paid/cancelled (optional optimization)
      if (
        currentOrder?.status === "PAID" ||
        currentOrder?.status === "CANCELLED"
      )
        return false;

      // Otherwise, keep checking every 1000ms
      return 1000;
    },
  });

  // 1. Initial Loading State (First fetch)
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
          <p className="text-gray-500">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) return <div>Order not found</div>;

  const clientSecret = order.paymentClientSecret;

  // ✅ 2. ADD THIS: The "Waiting Room"
  // Instead of showing an error, show a "Initializing" spinner while we poll.
  if (!clientSecret) {
    return (
      <div className="flex h-screen items-center justify-center flex-col bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800">
          Initializing Payment
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          Please wait while we secure your connection...
        </p>
      </div>
    );
  }

  // 3. Ready State
  // We only reach here if clientSecret exists, preventing the crash!
  const appearance = {
    theme: "stripe" as const,
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Secure Payment</h1>
          <p className="mt-2 text-gray-600">
            Complete your purchase for Order #{order.id.slice(-6).toUpperCase()}
          </p>
        </div>

        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm orderId={order.id} amount={Number(order.totalAmount)} />
        </Elements>
      </div>
    </div>
  );
}
