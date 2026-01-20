"use client";

import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { clearCart } from "@/actions/cart";

export const ClearCartButton = () => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const handleClearCart = async () => {
    await clearCart();
  };
  return (
    <Button
      className="group shadow-md transition-all flex items-center text-white bg-red-500 hover:bg-red-600"
      disabled={pending}
      onClick={handleClearCart}
    >
      <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
      Clear Cart
    </Button>
  );
};
