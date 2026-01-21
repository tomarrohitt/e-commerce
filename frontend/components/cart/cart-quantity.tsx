"use client";

import { updateCartItem } from "@/actions/cart";
import { CartItemWithProduct } from "@/types";
import { Loader2, Minus, Plus } from "lucide-react";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

export const CartQuantity = ({ item }: { item: CartItemWithProduct }) => {
  const [pending, startTransition] = useTransition();
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const router = useRouter();

  const handleQuantityChange = (delta: number) => {
    if (pending) return;

    startTransition(async () => {
      try {
        await updateCartItem(item.productId, item.quantity + delta);
        router.refresh();
      } catch (error) {
        setLocalQuantity(item.quantity);
        console.error("Error updating cart item:", error);
      }
    });
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
      <button
        disabled={pending || item.quantity === 1}
        className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent group"
        onClick={() => handleQuantityChange(-1)}
      >
        <Minus className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
      </button>
      <span className="w-12 text-center font-bold text-gray-900">
        {pending ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : (
          localQuantity
        )}
      </span>
      <button
        disabled={pending || localQuantity >= item.product.stockQuantity}
        className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent group"
        onClick={() => handleQuantityChange(1)}
      >
        <Plus className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
      </button>
    </div>
  );
};
