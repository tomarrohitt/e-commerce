import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Clock, Ban, AlertCircle } from "lucide-react";
import { getOrder } from "@/lib/api/orders";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderShippingCard } from "@/components/orders/order-shipping-card";
import { OrderExtended } from "@/types";
import { InvoiceDownloadButton } from "@/components/orders/invoice-download-button";

interface OrderDetailsPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
      case "COMPLETED":
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200";
      case "AWAITING_PAYMENT":
      case "PENDING":
      case "CONFIRMED":
      case "SHIPPED":
        return "bg-gray-100 text-gray-500 border-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.id.toUpperCase()}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}
            >
              {order.status === "CREATED"
                ? "AWAITING PAYMENT"
                : order.status.replace("_", " ")}
            </span>
          </div>
          <Link
            href="/orders"
            className="text-sm font-medium text-blue-500 hover:text-blue-700 hover:underline"
          >
            &larr; Back to Orders
          </Link>
        </div>
        <p className="text-gray-500">
          Placed on{" "}
          {new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          at {new Date(order.createdAt).toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Addresses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="shadow-md pt-0">
            <CardHeader className="bg-gray-50 border-b pt-6">
              <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.productId} className="p-6 flex gap-4">
                    <Link
                      href={`/products/${item.productId}`}
                      className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200"
                    >
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          loading="eager"
                          alt={item.name}
                          sizes="80px"
                          fill
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          📦
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 flex justify-between">
                      <div>
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-semibold text-gray-900 hover:text-blue-500"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <OrderShippingCard
            label="Shipping Address"
            address={order.shippingAddress}
          />
          <OrderShippingCard
            label="Billing Address"
            address={order.billingAddress}
          />
        </div>

        {/* Right Column: Summary & Payment */}
        <div className="lg:col-span-1">
          <Card className="shadow-md sticky top-6 pt-0">
            <CardHeader className="bg-gray-50 border-b pt-6">
              <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span>
                  <span>${Number(order.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-green-500 font-medium">Free</span>
                </div>
                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-blue-500">
                    ${Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Payment Status
                </h3>
                <PaymentStatus order={order} />
              </div>

              {order.invoiceUrl && (
                <div className="mt-6 block w-full text-center">
                  <InvoiceDownloadButton
                    orderId={order.id}
                    className="w-full"
                  />
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  Need help with this order?{" "}
                  <a href="/support" className="text-blue-500 hover:underline">
                    Contact Support
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PaymentStatus({ order }: { order: OrderExtended }) {
  let status: "REFUNDED" | "SUCCESS" | "CANCELLED" | "PENDING";

  if (order.paid && order.refunded) {
    status = "REFUNDED";
  } else if (order.paid && !order.refunded) {
    status = "SUCCESS";
  } else if (!order.paid && order.status === "CANCELLED") {
    status = "CANCELLED";
  } else {
    status = "PENDING";
  }

  switch (status) {
    case "SUCCESS":
      return (
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-900">
              Payment Successful
            </p>
            <p className="text-xs text-green-700">
              via Stripe{" "}
              {order.paymentId ? `• ${order.paymentId.slice(-4)}` : ""}
            </p>
          </div>
        </div>
      );

    case "REFUNDED":
      return (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-900">Order Refunded</p>
            <p className="text-xs text-red-700">
              The payment has been returned to your original method.
            </p>
          </div>
        </div>
      );

    case "CANCELLED":
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Order Cancelled</p>
            <p className="text-xs text-gray-500">
              This order was cancelled and no payment was collected.
            </p>
          </div>
        </div>
      );

    case "PENDING":
      return (
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-800">
              Payment Pending
            </span>
          </div>
          <Link href={`/checkout/payment?orderId=${order.id}`}>
            <Button className="w-full bg-blue-500 hover:bg-blue-700 text-white">
              Complete Payment
            </Button>
          </Link>
        </div>
      );
  }
}
