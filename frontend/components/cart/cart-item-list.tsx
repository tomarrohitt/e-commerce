"use client";

import { CartItemWithProduct } from "@/types";
import { AnimatePresence, motion } from "motion/react";
import { CartItem } from "./cart-item";

export const CartItemList = ({ items }: { items: CartItemWithProduct[] }) => {
  return (
    <div className="lg:col-span-2 space-y-4">
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.productId}
            layout // This prop makes the item animate its position when siblings change
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 0.9,
              x: -100, // Slides to the left
              filter: "blur(10px)", // Adds a motion blur effect
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              mass: 1,
            }}
          >
            <CartItem item={item} isUpdating={false} />
          </motion.div>
        ))}
      </AnimatePresence>

      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-10 text-gray-500"
        >
          Your cart is empty.
        </motion.div>
      )}
    </div>
  );
};
