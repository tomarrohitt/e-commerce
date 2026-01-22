import {
  Home,
  Shirt,
  Smartphone,
  Sparkles,
  Utensils,
  Wrench,
} from "lucide-react";
import { motion, Variants } from "motion/react";

export default function CategoriesSection() {
  const categories = [
    {
      id: 1,
      name: "Fashion",
      icon: Shirt,
      delay: 0,
    },
    {
      id: 2,
      name: "Tools",
      icon: Wrench,
      delay: 0.1,
    },
    {
      id: 3,
      name: "Electronics",
      icon: Smartphone,
      delay: 0.2,
    },
    {
      id: 4,
      name: "Home & Garden",
      icon: Home,
      delay: 0.3,
    },
    {
      id: 5,
      name: "Kitchen",
      icon: Utensils,
      delay: 0.4,
    },
    {
      id: 6,
      name: "More",
      icon: Sparkles,
      delay: 0.5,
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // 3. Annotate itemVariants
  // This tells TS that "spring" is a valid transition type, not just a random string
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="w-full py-20 px-6 lg:px-8 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Explore our curated collections and find exactly what you need for
            your lifestyle.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  backgroundColor: "rgba(239, 246, 255, 1)", // blue-50
                  borderColor: "rgba(59, 130, 246, 0.5)", // blue-500
                }}
                whileTap={{ scale: 0.95 }}
                className="relative flex flex-col items-center justify-center p-8 rounded-3xl bg-white border border-gray-100 shadow-sm transition-colors duration-300 group cursor-pointer"
              >
                <div className="relative mb-4">
                  {/* Icon Background Blob */}
                  <motion.div
                    className="absolute inset-0 bg-blue-100 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    layoutId={`blob-${category.id}`}
                  />

                  {/* Icon */}
                  <div className="relative z-10 p-3 bg-white/50 backdrop-blur-sm rounded-2xl ring-1 ring-gray-100 group-hover:ring-blue-200 transition-all">
                    <Icon className="w-8 h-8 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                  </div>
                </div>

                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors duration-300">
                  {category.name}
                </span>

                {/* Hover shine effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/40 to-transparent translate-x-full v transition-transform duration-700" />
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
