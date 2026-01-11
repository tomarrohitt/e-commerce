"use client";

import { updateCartItem } from "@/actions/cart";
import { CartItemWithProduct } from "@/types";
import { Loader2, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export const CartQuantity = ({ item }: { item: CartItemWithProduct }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleQuantityChange = async (quantity: number) => {
    if (pending) return;
    startTransition(async () => {
      await updateCartItem(item.productId, item.quantity + quantity);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
      <button
        className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent group"
        onClick={() => handleQuantityChange(-1)}
        disabled={pending || item.quantity === 1}
      >
        <Minus className="w-4 h-4 text-gray-600 group-hover:text-purple-600" />
      </button>
      <span className="w-12 text-center font-bold text-gray-900">
        {pending ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : (
          item.quantity
        )}
      </span>
      <button
        disabled={pending || item.quantity >= item.product.stockQuantity}
        className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent group"
        onClick={() => handleQuantityChange(1)}
      >
        <Plus className="w-4 h-4 text-gray-600 group-hover:text-purple-600" />
      </button>
    </div>
  );
};
