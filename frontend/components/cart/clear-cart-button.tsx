"use client";

import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { clearCart } from "@/actions/cart";

export const ClearCartButton = () => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const handleClearCart = () => {
    startTransition(async () => {
      await clearCart();
      router.refresh();
    });
  };
  return (
    <Button
      variant="danger"
      className="group shadow-md hover:shadow-lg transition-all flex items-center"
      disabled={pending}
      onClick={handleClearCart}
    >
      <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform opacity-" />
      Clear Cart
    </Button>
  );
};
