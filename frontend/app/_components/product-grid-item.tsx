import Image from "next/image";
import { motion } from "motion/react";

export const ProductGridItem = ({
  product,
  className = "",
  showCategory = true,
  variants,
}: {
  product: { image: string; alt: string; category: string };
  className?: string;
  showCategory?: boolean;
  variants: any;
}) => {
  return (
    <motion.div
      variants={variants}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      className={className}
    >
      <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
        <Image
          src={product.image}
          alt={product.alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {showCategory && (
          <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 inline-block">
              <span className="text-xs text-blue-600 font-medium">
                {product.category}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
