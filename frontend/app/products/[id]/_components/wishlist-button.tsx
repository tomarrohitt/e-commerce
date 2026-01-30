"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WishlistButton({ productId }: { productId: string }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleWishlist = async () => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setIsWishlisted(!isWishlisted);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`h-12 w-12 rounded-xl border-2 transition-all ${
        isWishlisted
          ? "border-red-300 bg-red-50 text-red-500 hover:bg-red-100"
          : "border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500"
      }`}
    >
      <Heart
        className={`w-5 h-5 transition-all ${
          isWishlisted ? "fill-red-500" : ""
        }`}
      />
    </Button>
  );
}
