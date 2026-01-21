import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { CartItemWithProduct } from "@/types";
import { Loader2 } from "lucide-react";
import { RemoveItemFromCartButton } from "./remove-item-from-cart-button";
import { CartQuantity } from "./cart-quantity";
import Image from "next/image";

type CartItemProps = {
  item: CartItemWithProduct;
  isUpdating: boolean;
};

export function CartItem({ item, isUpdating }: CartItemProps) {
  const isOutOfStock = item.product.stockQuantity === 0;
  const exceedsStock = item.quantity > item.product.stockQuantity;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 flex space-x-4 border-2 border-transparent hover:border-blue-100">
      <Link
        href={`/products/${item.productId}`}
        className="shrink-0 group relative"
      >
        <div className="w-24 h-24 bg-linear-to-br from-blue-400 to-indigo-500 rounded-lg overflow-hidden ring-2 ring-transparent group-hover:ring-blue-300 transition-all duration-200">
          {item.product.thumbnail ? (
            <Image
              src={item.product.thumbnail}
              fill
              alt={item.product.name}
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-3xl">
              📦
            </div>
          )}
        </div>
        {isUpdating && (
          <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        )}
      </Link>

      <div className="flex-1 flex flex-col">
        <Link
          href={`/products/${item.productId}`}
          className="font-semibold text-lg text-gray-900 hover:text-blue-500 transition-colors mb-1 line-clamp-2"
        >
          {item.product.name}
        </Link>

        <p className="text-2xl font-bold text-blue-500 mb-3">
          ${formatPrice(item.product.price)}
          <span className="text-sm text-gray-500 font-normal ml-2">/ item</span>
        </p>

        {isOutOfStock ? (
          <Badge
            variant="destructive"
            className="mb-3 w-fit animate-in fade-in duration-300"
          >
            🚫 Out of stock
          </Badge>
        ) : exceedsStock ? (
          <Badge
            variant="secondary"
            className="mb-3 w-fit animate-in fade-in duration-300"
          >
            ⚠️ Only {item.product.stockQuantity} left in stock
          </Badge>
        ) : item.product.stockQuantity <= 5 ? (
          <Badge variant="secondary" className="mb-3 w-fit">
            ⏰ Only {item.product.stockQuantity} left!
          </Badge>
        ) : null}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-3">
            <CartQuantity item={item} />
            <RemoveItemFromCartButton productId={item.productId} />
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Item Total</p>
            <p className="text-xl font-bold text-gray-900">
              ${formatPrice(item.product.price * item.quantity)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
