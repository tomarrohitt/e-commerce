"use client";

import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { removeFromCart } from "@/actions/cart";

export const RemoveItemFromCartButton = ({
  productId,
}: {
  productId: string;
}) => {
  const pending = false;
  const handleRemoveItem = async () => {
    await removeFromCart(productId);
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      className="group gap-1"
      disabled={pending}
      onClick={handleRemoveItem}
    >
      {pending ? "Removing..." : "Remove"}
      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
    </Button>
  );
};
