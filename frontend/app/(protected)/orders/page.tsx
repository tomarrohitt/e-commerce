"use client";

import Link from "next/link";
import { useOrders } from "@/hooks/use-orders";
import { OrderCard } from "@/components/orders/order-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const { orders, isLoading, cancelOrder, isCancelling, downloadInvoice } =
    useOrders();

  if (isLoading) {
    return <OrdersPageSkeleton />;
  }

  if (orders.length === 0) {
    return <EmptyOrdersState />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">View and track all your orders</p>
      </div>

      <div className="space-y-6">
        {orders?.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onCancel={cancelOrder}
            onDownloadInvoice={downloadInvoice}
            isCancelling={isCancelling}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyOrdersState() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
        <p className="text-gray-600 mb-6">
          Start shopping to see your orders here
        </p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    </div>
  );
}

function OrdersPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="animate-pulse space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6">
            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
