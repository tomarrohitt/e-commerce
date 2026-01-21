import Link from "next/link";
import { OrderItem, OrderStatusType } from "@/types";
import Image from "next/image";

interface OrderItemsListProps {
  orderItems: OrderItem[];
}

export function OrderItemsList({ orderItems }: OrderItemsListProps) {
  return (
    <>
      <div className="space-y-3 mb-4">
        {orderItems.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <Link
              href={`/products/${item.productId}`}
              className="relative w-16 h-16 bg-linear-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shrink-0"
            >
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.name}
                  className="object-cover rounded-lg"
                  fill
                />
              ) : (
                <span className="text-white text-2xl">📦</span>
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.productId}`}
                className="font-semibold text-gray-900 hover:text-blue-500 transition-colors line-clamp-1"
              >
                {item.name}
              </Link>
              <p className="text-sm text-gray-500 mt-0.5">
                Quantity: {item.quantity} × ${item.price}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="font-semibold text-gray-900">
                ${(item.quantity * Number(item.price)).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
