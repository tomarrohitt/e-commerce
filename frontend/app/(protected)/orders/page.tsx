"use client";

import Link from "next/link";
import { orderService } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

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

export default function OrdersPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const queryClient = useQueryClient();

  const { data: ordersData, isLoading: isDataLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.getOrders(),
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: (orderId: string) => {
      return orderService.cancelOrder(orderId);
    },
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      toast.error(error.error || "Failed to cancel order");
    },
  });

  const downloadInvoice = async (orderId: string) => {
    const url = await orderService.downloadInvoice(orderId);
    window.open(url, "_blank");
  };

  const orders: Order[] = ordersData?.orders || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      PAID: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      REFUNDED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const loading = isAuthLoading || isDataLoading;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6">
              <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">View and track all your orders</p>
      </div>
      {!loading && orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Orders Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start shopping to see your orders here
          </p>
          <Link
            href="/products"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-mono font-semibold text-gray-900">
                      {order.id.toUpperCase()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-lg font-bold text-purple-600">
                      ${order.totalAmount}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="w-16 h-16 bg-linear-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center">
                        {item.thumbnail.length > 0 ? (
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-white text-2xl">📦</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ${item.price}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${item.quantity * Number(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Shipping Address:
                  </p>
                  <p className="text-sm text-gray-600">
                    {order?.shippingAddress?.street},{" "}
                    {order?.shippingAddress?.city},{" "}
                    {order?.shippingAddress?.state},{" "}
                    {order?.shippingAddress?.country},{" "}
                    {order?.shippingAddress?.zipCode}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-8">
                  <Link
                    href={`/orders/${order?.id}`}
                    className="text-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    View Details
                  </Link>

                  {![
                    "CANCELLED",
                    "SHIPPED",
                    "DELIVERED",
                    "FAILED",
                    "REFUNDED",
                  ].includes(order.status) && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      disabled={isCancelling}
                      className="text-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                  {order.status === "PAID" && (
                    <button
                      onClick={() => downloadInvoice(order.id)}
                      className="text-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Download Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
