"use client";

import { useCart } from "@/contexts/cart-context";
import { cartService } from "@/lib/api"; // Or wherever your cart logic is
import toast from "react-hot-toast";

interface AddToCartButtonProps {
  productId: string;
  isOutOfStock: boolean;
}

export default function AddToCartButton({
  productId,
  isOutOfStock,
}: AddToCartButtonProps) {
  const { refreshCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      await cartService.addToCart(productId, 1);
      toast.success("Added to cart!");
      await refreshCart();
    } catch (error: any) {
      toast.error(error.error || "Failed to add to cart");
    }
  };

  return (
    <button
      disabled={isOutOfStock}
      className={`mt-4 w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
        isOutOfStock
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-[1.02]"
      }`}
      onClick={handleAddToCart}
    >
      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
    </button>
  );
}
