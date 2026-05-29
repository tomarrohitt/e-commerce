"use client";

import { useTransition, useState, useEffect } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { addToCart } from "@/actions/cart";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
      } catch (err) {
        toast.error("Failed to add to cart");
      }
    });
  }

  useEffect(() => {
    if (added && !pending) {
      const timer = setTimeout(() => {
        setAdded(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [added, pending]);

  const getButtonContent = () => {
    if (pending) {
      return (
        <div className="flex items-center gap-x-2 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Adding...</span>
        </div>
      );
    }

    if (added) {
      return (
        <div className="flex items-center gap-x-2 justify-center">
          <Check className="w-5 h-5" />
          <span>Added to Cart!</span>
        </div>
      );
    }

    if (isOutOfStock) {
      return <span>Out of Stock</span>;
    }

    return (
      <div className="flex items-center gap-x-2 justify-center">
        <ShoppingCart className="w-5 h-5" />
        <span>Add to Cart</span>
      </div>
    );
  };

  const getButtonStyles = () => {
    if (isOutOfStock) {
      return "bg-slate-200 text-slate-500 cursor-not-allowed border-2 border-slate-300";
    }

    if (pending) {
      return "bg-blue-400 text-white cursor-wait border-2 border-blue-500 opacity-80";
    }

    if (added) {
      return "bg-emerald-500 text-white border-2 border-emerald-600";
    }

    return "bg-gradient-to-r from-blue-500 to-blue-500 text-white hover:from-blue-600 hover:to-blue-600 border-2 border-blue-600 hover:border-blue-600";
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
