"use client";

import { updateCartItem } from "@/actions/cart";
import { CartItemWithProduct } from "@/types";
import { AnimatePresence, motion, Variants } from "motion/react";
import { Loader2, Minus, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export const CartQuantity = ({ item }: { item: CartItemWithProduct }) => {
  const [pending, startTransition] = useTransition();
  const [direction, setDirection] = useState(1);

  const router = useRouter();

  const handleQuantityChange = (delta: number) => {
    if (pending) return;

    setDirection(delta);

    startTransition(async () => {
      try {
        await updateCartItem(item.productId, item.quantity + delta);
        router.refresh();
      } catch (error) {
        console.error("Error updating cart item:", error);
      }
    });
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1 shadow-sm border border-gray-100">
      <motion.button
        whileHover={{ scale: 1.1, backgroundColor: "#eef2ff" }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        disabled={pending || item.quantity === 1}
        className="w-8 h-8 rounded-md border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed group z-10"
        onClick={() => handleQuantityChange(-1)}
      >
        <Minus className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
      </motion.button>
      <div className="w-12 h-8 relative flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          {pending ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            </motion.div>
          ) : (
            <motion.span
              key={item.quantity}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute font-bold text-gray-900 tabular-nums"
            >
              {item.quantity}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ scale: 1.1, backgroundColor: "#eef2ff" }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        disabled={pending || item.quantity >= item.product.stockQuantity}
        className="w-8 h-8 rounded-md border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed group z-10"
        onClick={() => handleQuantityChange(1)}
      >
        <Plus className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
      </motion.button>
    </div>
  );
};

// 2. Add the ': Variants' type annotation here
const slideVariants: Variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 20 : -20,
    opacity: 0,
    scale: 0.8,
  }),
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  exit: (direction: number) => ({
    y: direction > 0 ? -20 : 20,
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  }),
};
