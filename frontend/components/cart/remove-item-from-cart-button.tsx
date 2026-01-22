"use client";
import { motion } from "motion/react";
import { removeFromCart } from "@/actions/cart";
import { X } from "lucide-react";
import { useTransition } from "react";

export const RemoveItemFromCartButton = ({
  productId,
}: {
  productId: string;
}) => {
  const [pending, startTransition] = useTransition();
  const handleRemoveItem = () => {
    startTransition(async () => {
      await removeFromCart(productId);
    });
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleRemoveItem}
      className="p-2 hover:bg-red-50 rounded-xl transition-colors group/delete absolute right-8 top-5"
      disabled={pending}
    >
      <X className="w-5 h-5 text-gray-400 group-hover/delete:text-red-500" />
    </motion.button>
  );
};
