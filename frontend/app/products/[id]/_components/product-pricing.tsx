import { Badge } from "@/components/ui/badge";
import { entranceAnim } from "@/lib/constants/enter-animation";
import { Check } from "lucide-react";
import React from "react";

const discountPercentage = 25;

export const ProductPricing = ({
  price,
  stockQuantity,
}: {
  price: number;
  stockQuantity: number;
}) => {
  const originalPrice = Number(price) * (1 + discountPercentage / 100);

  return (
    <div className={`space-y-4 ${entranceAnim} delay-150`}>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-gray-900">
          ${Number(price).toFixed(2)}
        </span>
        <span className="text-lg text-gray-400 line-through mb-1">
          ${originalPrice.toFixed(2)}
        </span>
        <Badge variant="destructive" className="mb-2">
          {discountPercentage}% OFF
        </Badge>
      </div>

      {stockQuantity > 0 ? (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full text-sm">
          <Check className="w-4 h-4" />
          <span className="font-medium">
            In Stock ({stockQuantity} available)
          </span>
        </div>
      ) : (
        <Badge variant="destructive">Out of Stock</Badge>
      )}
    </div>
  );
};
