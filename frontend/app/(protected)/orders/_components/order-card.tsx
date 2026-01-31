import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderItemsList } from "./order-item-list";
import { OrderActions } from "./order-actions";
import { Order } from "@/types";
import { entranceAnim } from "@/lib/constants/enter-animation";

interface OrderCardProps {
  order: Order;
  index: number;
}

export function OrderCard({ order, index }: OrderCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow pt-0">
      <CardHeader
        className={`bg-gray-50 border-b pt-6 ${entranceAnim}`}
        style={{
          animationDelay: `${100 + index * 300}ms`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-mono font-semibold text-gray-900">
              {order.id.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium text-gray-900">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-lg font-bold text-blue-500">
              ${order.totalAmount}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent>
        <OrderItemsList orderItems={order.items} status={order.status} />

        <div
          className={`bg-gray-50 rounded-lg p-4 mb-4 ${entranceAnim}`}
          style={{
            animationDelay: `${120 + index * 300}ms`,
          }}
        >
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Shipping Address:
          </p>
          <p className="text-sm text-gray-500">
            {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.state}, {order.shippingAddress.country},{" "}
            {order.shippingAddress.zipCode}
          </p>
        </div>

        <OrderActions
          orderId={order.id}
          status={order.status}
          invoiceUrl={order.invoiceUrl}
        />
      </CardContent>
    </Card>
  );
}
