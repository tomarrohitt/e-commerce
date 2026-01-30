"use client";

import { Headphones, RotateCcw, Shield, Truck } from "lucide-react";
// 1. Import Variants to ensure type safety
import { motion, Variants } from "motion/react";

export default function FeaturesSection() {
  const features = [
    {
      id: 1,
      icon: Truck,
      title: "Free Shipping",
      description: "On orders over $50",
    },
    {
      id: 2,
      icon: Shield,
      title: "Secure Payment",
      description: "100% protected checkout",
    },
    {
      id: 3,
      icon: RotateCcw,
      title: "Easy Returns",
      description: "30-day return policy",
    },
    {
      id: 4,
      icon: Headphones,
      title: "24/7 Support",
      description: "We're here to help",
    },
  ];

  // 2. Define Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Delay between each card appearing
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  return (
    <section className="w-full py-16 px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                whileHover={{ y: -8 }} // Lifts the card up
                className="group flex flex-col items-center text-center gap-4 p-8 rounded-2xl bg-white border border-transparent hover:border-blue-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-default"
              >
                {/* Icon Wrapper with Color Transition */}
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* The Icon itself - Spins on hover */}
                    <motion.div
                      // We use a separate motion div for the icon to rotate it independently
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6, ease: "backOut" }}
                    >
                      <Icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </motion.div>
                  </motion.div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
