"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function AnimatedCart({ children }: { children: React.ReactNode }) {
  return (
    <Link href="/cart">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors "
      >
        <ShoppingCart className="w-6 h-6" />
        {children}
      </motion.div>
    </Link>
  );
}
