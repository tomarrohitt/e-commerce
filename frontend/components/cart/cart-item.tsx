import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { CartItemWithProduct } from "@/types";

type CartItemProps = {
  item: CartItemWithProduct;
  isUpdating: boolean;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

export function CartItem({
  item,
  isUpdating,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const isOutOfStock = item.product.stockQuantity === 0;
  const exceedsStock = item.quantity > item.product.stockQuantity;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex space-x-4">
      <Link href={`/products/${item.productId}`} className="shrink-0">
        <div className="w-24 h-24 bg-linear-to-br from-purple-400 to-indigo-600 rounded-lg overflow-hidden">
          {item.product.thumbnail ? (
            <img
              src={item.product.thumbnail}
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-3xl">
              📦
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1">
        <Link
          href={`/products/${item.productId}`}
          className="font-semibold text-lg text-gray-900 hover:text-purple-600 transition-colors block mb-2"
        >
          {item.product.name}
        </Link>

        <p className="text-2xl font-bold text-purple-600 mb-4">
          ${formatPrice(item.product.price)}
        </p>

        {isOutOfStock ? (
          <Badge variant="danger" className="mb-3">
            Out of stock
          </Badge>
        ) : exceedsStock ? (
          <Badge variant="warning" className="mb-3">
            Only {item.product.stockQuantity} left in stock
          </Badge>
        ) : null}

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                onUpdateQuantity(item.productId, item.quantity - 1)
              }
              disabled={isUpdating || item.quantity <= 1}
              className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span className="w-12 text-center font-semibold">
              {isUpdating ? "..." : item.quantity}
            </span>
            <button
              onClick={() =>
                onUpdateQuantity(item.productId, item.quantity + 1)
              }
              disabled={
                isUpdating || item.quantity >= item.product.stockQuantity
              }
              className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onRemove(item.productId)}
            disabled={isUpdating}
          >
            Remove
          </Button>
        </div>

        <div className="mt-4 text-right">
          <p className="text-sm text-gray-600">Item Total</p>
          <p className="text-xl font-bold text-gray-900">
            ${formatPrice(item.product.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}
