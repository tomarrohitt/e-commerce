import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderItemsList } from "./order-item-list";
import { OrderActions } from "./order-actions";
import { Order } from "@/types";

interface OrderCardProps {
  order: Order;
  onCancel: (orderId: string) => void;
  onDownloadInvoice: (orderId: string) => void;
  isCancelling: boolean;
}

export function OrderCard({
  order,
  onCancel,
  onDownloadInvoice,
  isCancelling,
}: OrderCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gray-50 border-b">
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
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent>
        {/* Pass status to OrderItemsList so it can show review buttons */}
        <OrderItemsList orderItems={order.items} status={order.status} />

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Shipping Address:
          </p>
          <p className="text-sm text-gray-600">
            {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.state}, {order.shippingAddress.country},{" "}
            {order.shippingAddress.zipCode}
          </p>
        </div>

        <OrderActions
          orderId={order.id}
          status={order.status}
          invoiceUrl={order.invoiceUrl}
          onCancel={() => onCancel(order.id)}
          onDownloadInvoice={() => onDownloadInvoice(order.id)}
          isCancelling={isCancelling}
        />
      </CardContent>
    </Card>
  );
}
