"use client";
import { useTransition, useState, useEffect } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { addToCart } from "@/actions/cart";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  productId: string;
  isOutOfStock: boolean;
  className: string;
  quantity?: number;
}

export default function AddToCartButton({
  productId,
  isOutOfStock,
  className,
  quantity,
}: AddToCartButtonProps) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  async function handleAddToCart() {
    if (added) return;

    startTransition(async () => {
      try {
        await addToCart(productId, quantity || 1);
        setAdded(true);
      } catch (err) {}
    });
  }

  useEffect(() => {
    if (!pending) {
      setTimeout(() => {
        setAdded(false);
      }, 2000);
    }
  }, [pending]);

  const getButtonContent = () => {
    if (pending) {
      return (
        <div className="flex items-center justify-center gap-x-5">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Adding...</span>
        </div>
      );
    }

    if (added) {
      return (
        <div className="flex items-center justify-center gap-x-5">
          <Check className="w-5 h-5" />
          <span>Added to Cart!</span>
        </div>
      );
    }

    if (isOutOfStock) {
      <div className="flex items-center justify-center gap-x-5">
        return <span>Out of Stock</span>;
      </div>;
    }

    return (
      <div className="flex items-center justify-center gap-x-5">
        <ShoppingCart className="w-5 h-5" />
        <span>Add to Cart</span>
      </div>
    );
  };

  const getButtonStyles = () => {
    if (isOutOfStock) {
      return "bg-gray-300 text-gray-500 cursor-not-allowed";
    }

    if (pending) {
      return "bg-blue-500 text-white cursor-wait";
    }
    if (added) {
      return "bg-green-500 text-white";
    }

    return "bg-blue-500 text-white hover:bg-blue-700 active:scale-95";
  };
  return (
    <button
      disabled={isOutOfStock || pending || added}
      className={cn(getButtonStyles(), className)}
      onClick={handleAddToCart}
    >
      {getButtonContent()}
    </button>
  );
}
