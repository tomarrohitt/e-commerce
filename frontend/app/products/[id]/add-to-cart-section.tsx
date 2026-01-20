// add-to-cart-button.tsx
"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddToCartButton from "@/components/add-to-cart";

export function AddToCartSection({
  productId,
  maxQuantity,
}: {
  productId: string;
  maxQuantity: number;
}) {
  const [quantity, setQuantity] = useState(1);

  const limitedMaxQuantity = Math.min(10, maxQuantity);

  return (
    <div className="flex-1 flex gap-3">
      <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="h-12 w-12 rounded-none hover:bg-gray-100"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <div className="w-16 text-center font-semibold text-gray-900">
          {quantity}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setQuantity(Math.min(limitedMaxQuantity, quantity + 1))
          }
          disabled={quantity >= limitedMaxQuantity}
          className="h-12 w-12 rounded-none hover:bg-gray-100"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <AddToCartButton
        quantity={quantity}
        productId={productId}
        isOutOfStock={maxQuantity === 0}
        className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
      />
    </div>
  );
}
