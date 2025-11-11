"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/lib/api"; // Assuming you have this

// Mockup of a more complete Order type
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

// This is our new fetcher function for useQuery
const fetchOrderById = async (orderId: string): Promise<Order> => {
  const response = await orderService.getOrder(orderId);
  console.log(response);
  return response.order;
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const {
    data: order, // 'data' contains our successful order object
    isLoading, // Replaces our 'loading' state
    isError, // A boolean for the error state
    error, // The error object itself
  } = useQuery({
    queryKey: ["order", orderId], // A unique key for this query
    queryFn: () => fetchOrderById(orderId), // The function that fetches data
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Skeleton Loader */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-8"></div>
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <div className="h-32 bg-gray-300 rounded"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">Order Not Found</h1>
        <p className="text-gray-600 mt-2">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <Link
          href="/"
          className="inline-block mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Go Home
        </Link>
      </div>
    );
  }

  if (!order) {
    return null; // Should be covered by loading/error states
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-600">Order #{order.id}</p>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content (Items) */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Items
              </h2>
              <div className="space-y-4">
                {(order.orderItems || []).map((item) => (
                  <div key={item.id} className="flex space-x-4">
                    <img
                      src={
                        item.product.images[0] ||
                        "https://placehold.co/100x100/6366f1/white?text=📦"
                      }
                      alt={item.product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${item.priceAtPurchase * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (Summary) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 space-y-4 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>

              {/* Status */}
              <div className="flex items-center gap-x-2">
                <p className="font-semibold text-gray-700">Order: </p>
                <p className="font-bold text-lg text-blue-600 uppercase">
                  {order.status}
                </p>
              </div>
              <div className="flex items-center gap-x-2">
                <p className="font-semibold text-gray-700">Payment Status: </p>
                <p
                  className={`font-bold text-lg uppercase ${
                    order.stripePaymentIntentId
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.stripePaymentIntentId ? "PAID" : "PENDING"}
                </p>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-700">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${order.totalAmount}
                </p>
              </div>

              {/* Shipping Address */}
              <div>
                <p className="font-semibold text-gray-700">Shipping To</p>
                <address className="text-gray-600 not-italic text-sm mt-1">
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                  <br />
                </address>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
