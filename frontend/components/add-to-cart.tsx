"use client";
import { useTransition, useState } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/actions/cart";

interface AddToCartButtonProps {
  productId: string;
  isOutOfStock: boolean;
}

export default function AddToCartButton({
  productId,
  isOutOfStock,
}: AddToCartButtonProps) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(false);

  const router = useRouter();

  async function handleAddToCart() {
    if (added) return;

    setError(false);
    startTransition(async () => {
      try {
        await addToCart(productId, 1);
        router.refresh();
        setAdded(true);
        setTimeout(() => {
          setAdded(false);
        }, 2000);
      } catch (err) {
        setError(true);
        setTimeout(() => {
          setError(false);
        }, 3000);
      }
    });
  }

  const getButtonContent = () => {
    if (pending) {
      return (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Adding...</span>
        </>
      );
    }

    if (added) {
      return (
        <>
          <Check className="w-5 h-5" />
          <span>Added to Cart!</span>
        </>
      );
    }

    if (isOutOfStock) {
      return <span>Out of Stock</span>;
    }

    return (
      <>
        <ShoppingCart className="w-5 h-5" />
        <span>Add to Cart</span>
      </>
    );
  };

  const getButtonStyles = () => {
    if (isOutOfStock) {
      return "bg-gray-300 text-gray-500 cursor-not-allowed";
    }

    if (error) {
      return "bg-red-600 text-white hover:bg-red-700";
    }

    if (added) {
      return "bg-green-600 text-white";
    }

    return "bg-purple-600 text-white hover:bg-purple-700 active:scale-95";
  };

  return (
    <button
      disabled={isOutOfStock || pending || added}
      className={`
        mt-4 w-full py-2.5 px-4 rounded-lg font-semibold
        transition-all duration-200 ease-in-out
        flex items-center justify-center gap-2
        transform hover:scale-[1.02]
        disabled:transform-none disabled:hover:scale-100
        ${getButtonStyles()}
      `}
      onClick={handleAddToCart}
    >
      {error ? "Failed - Try Again" : getButtonContent()}
    </button>
  );
}
