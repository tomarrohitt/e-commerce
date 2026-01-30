"use client";
import { ShoppingCart, Sparkles, Star, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ProductSearch } from "./product-search";
import { entranceAnim } from "@/lib/constants/enter-animation";

export const ProductWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="relative bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 40% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div
              className={`flex items-center gap-2 justify-center my-10 
             bg-white/30 backdrop-blur-md border border-white/20 shadow-lg 
             rounded-lg px-6 py-2 w-fit mx-auto ${entranceAnim}`}
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-white">
                Discover Amazing Products
              </span>
            </div>

            <h1
              className={`text-6xl lg:text-7xl text-white mb-6 leading-tight ${entranceAnim} delay-75`}
            >
              Shop Your
              <span
                className={`block bg-linear-to-r from-yellow-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent bg-size-[200%_auto] ${entranceAnim} delay-100`}
              >
                Favorites
              </span>
            </h1>

            <p
              className={`text-xl lg:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto ${entranceAnim} delay-150`}
            >
              Curated collection of premium products at unbeatable prices
            </p>

            <ProductSearch />

            <div className="flex items-center justify-center gap-8 mt-10 text-white/90">
              <div
                className={`flex items-center gap-2 ${entranceAnim} delay-300`}
              >
                <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                <span className="text-sm">4.8 Average Rating</span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-white/30" />
              <div
                className={`flex items-center gap-2 ${entranceAnim} delay-400`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm">1000+ Products</span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-white/30" />
              <div
                className={`flex items-center gap-2 ${entranceAnim} delay-500`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Free Shipping</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-px left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path
              fill="rgb(248 250 252)"
              d="M0,64L48,69.3C96,75,192,85,288,85.3C384,85,480,75,576,74.7C672,75,768,85,864,90.7C960,96,1056,96,1152,85.3C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </div>
      {children}
    </div>
  );
};
