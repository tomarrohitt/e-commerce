"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { LottieAnimation } from "@/components/lottie";

import Cart from "@/public/lottie/cart.json";

export function EmptyCartState() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg w-full"
      >
        <div className="relative mb-8 flex items-center justify-center">
          <LottieAnimation data={Cart} className="size-60" />
        </div>

        <h1 className="text-4xl text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 text-lg mb-8">
          Looks like you haven`&apos;t found anything you love yet. Let`&apos;s
          change that!
        </p>

        <Link href="/products">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 flex items-center justify-center gap-2 mx-auto"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-lg">Start Shopping</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
