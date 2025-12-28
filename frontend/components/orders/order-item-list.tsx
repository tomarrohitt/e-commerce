import { useState } from "react";
import Link from "next/link";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { ReviewModal } from "../review-modal";
import { OrderItem, OrderStatusType } from "@/types";

interface OrderItemsListProps {
  orderItems: OrderItem[];
  status: string;
}

export function OrderItemsList({ orderItems, status }: OrderItemsListProps) {
  const [reviewingProduct, setReviewingProduct] = useState<{
    id: string;
    name: string;
    thumbnail?: string;
  } | null>(null);

  const canReview = status === OrderStatusType.DELIVERED;

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
              className="w-16 h-16 bg-linear-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center shrink-0"
            >
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-white text-2xl">📦</span>
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.productId}`}
                className="font-semibold text-gray-900 hover:text-purple-600 transition-colors line-clamp-1"
              >
                {item.name}
              </Link>
              <p className="text-sm text-gray-600 mt-0.5">
                Quantity: {item.quantity} × ${item.price}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="font-semibold text-gray-900">
                ${(item.quantity * Number(item.price)).toFixed(2)}
              </p>
            </div>

            {canReview && (
              <div className="shrink-0 w-[140px] flex justify-end">
                <button
                  onClick={() =>
                    setReviewingProduct({
                      id: item.productId,
                      name: item.name,
                      thumbnail: item.thumbnail || undefined,
                    })
                  }
                  className="flex items-center gap-1.5 text-purple-600 text-sm font-medium bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Review
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {reviewingProduct && (
        <ReviewModal
          isOpen={!!reviewingProduct}
          onClose={() => setReviewingProduct(null)}
          productId={reviewingProduct.id}
          productName={reviewingProduct.name}
          productThumbnail={reviewingProduct.thumbnail}
        />
      )}
    </>
  );
}
