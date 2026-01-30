"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { clearCart } from "@/actions/cart";

const entranceAnim =
  "animate-in fade-in slide-in-from-bottom-4 duration-600 ease-out fill-mode-both";

export const ClearCartButton = () => {
  const [pending, startTransition] = useTransition();
  const handleClearCart = () => {
    startTransition(async () => {
      await clearCart();
    });
  };
  return (
    <Button
      className={`group shadow-md transition-all flex items-center text-white bg-red-500 hover:bg-red-600 ${entranceAnim}`}
      disabled={pending}
      onClick={handleClearCart}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
      )}
      Clear Cart
    </Button>
  );
};
