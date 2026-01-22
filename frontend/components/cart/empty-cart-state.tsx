"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
} from "lucide-react";

export function EmptyCartState() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg w-full"
      >
        {/* Icon */}
        <div className="relative mb-8">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-32 h-32 mx-auto bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-2xl"
          >
            <ShoppingCart
              className="w-16 h-16 text-blue-600"
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Floating dots */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -20, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
              className="absolute w-3 h-3 bg-blue-400 rounded-full"
              style={{
                left: `${30 + i * 20}%`,
                top: `${20 + i * 10}%`,
              }}
            />
          ))}
        </div>

        {/* Text */}
        <h1 className="text-4xl text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 text-lg mb-8">
          Looks like you haven`&apos;t found anything you love yet. Let`&apos;s
          change that!
        </p>

        {/* CTA Button */}
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

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
          {[
            { icon: Truck, text: "Free Shipping" },
            { icon: Shield, text: "Secure Payment" },
            { icon: Sparkles, text: "Quality Products" },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex flex-col items-center gap-2 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100"
            >
              <div className="p-3 bg-blue-100 rounded-xl">
                <item.icon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
