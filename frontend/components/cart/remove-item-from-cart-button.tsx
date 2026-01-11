"use client";

import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { removeFromCart } from "@/actions/cart";
import { useRouter } from "next/navigation";

export const RemoveItemFromCartButton = ({
  productId,
}: {
  productId: string;
}) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const handleRemoveItem = () => {
    startTransition(async () => {
      await removeFromCart(productId);
      router.refresh();
    });
  };

  return (
    <Button
      variant="danger"
      size="sm"
      className="group gap-1"
      disabled={pending}
      onClick={handleRemoveItem}
    >
      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
    </Button>
  );
};
