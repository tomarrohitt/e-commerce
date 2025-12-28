"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Star,
  Heart,
  ShoppingCart,
  Check,
  Truck,
  Shield,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useProduct } from "@/hooks/use-product";
import { DynamicAttributesSection } from "@/components/product/dynamic-attribute-section";
import { getCategorySchema } from "@/lib/category-schema";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/lib/api";
import { Review } from "@/types";

interface ProductDetailViewProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailView({ params }: ProductDetailViewProps) {
  const { id } = use(params);
  const { data: product, isLoading, error } = useProduct(id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "reviews"
  >("description");
  const [isWishlisted, setIsWishlisted] = useState(false);

  // 2. Loading & Error States
  if (isLoading) return <ProductSkeleton />;
  if (error || !product) return <ProductNotFound />;
  const categorySchema =
    product.category?.attributeSchema ||
    (product.category ? getCategorySchema(product.category.slug) : []);

  // Check if we actually have data to show
  const hasAttributes =
    product.attributes && Object.keys(product.attributes).length > 0;

  const maxQuantity = Math.min(10, product.stockQuantity);
  const discountPercentage = 25;
  const originalPrice = Number(product.price) * (1 + discountPercentage / 100);

  return (
    <div className="min-h-screen bg-gray-50 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div
              className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-gr
ay-200 relative group"
            >
              <img
                src={product.thumbnail || "/placeholder.png"}
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform du
ration-500"
              />
            </div>
            {product?.images?.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all bg-white
 ${
   selectedImage === index
     ? "border-purple-600 shadow-md ring-2 ring-purple-100"
     : "border-gray-200 hover:border-purple-300"
 }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 mt-4 lg:mt-0">
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="inline-block bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm fo
nt-semibold hover:bg-purple-200 transition-colors"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating Section */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <StarRating rating={product.rating || 0} />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {product.rating}
              </span>
              <span className="text-gray-500">
                ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price Section */}
            <div className="flex items-baseline space-x-4">
              <span className="text-4xl font-bold text-purple-600">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-lg text-gray-500 line-through">
                ${originalPrice.toFixed(2)}
              </span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                {discountPercentage}% OFF
              </span>
            </div>

            {/* Stock Section */}
            <div className="flex items-center space-x-2">
              {product.stockQuantity > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-semibold">
                    In Stock ({product.stockQuantity} available)
                  </span>
                </>
              ) : (
                <span className="flex items-center text-red-600 font-semibold">
                  <AlertCircle className="w-5 h-5 mr-2" /> Out of Stock
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-100 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border-2 border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(maxQuantity, quantity + 1))
                    }
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <button
                  disabled={product.stockQuantity === 0}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bol
d shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 d
isabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isWishlisted
                      ? "border-red-200 bg-red-50 text-red-600"
                      : "border-gray-200 hover:border-purple-300 text-gray-400"
                  }`}
                >
                  <Heart
                    className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <TrustBadge
                icon={Truck}
                label="Free Shipping"
                color="text-purple-600"
                bg="bg-purple-50"
              />
              <TrustBadge
                icon={Shield}
                label="Secure Payment"
                color="text-green-600"
                bg="bg-green-50"
              />
              <TrustBadge
                icon={RefreshCw}
                label="30-Day Returns"
                color="text-blue-600"
                bg="bg-blue-50"
              />
            </div>
          </div>
        </div>

        {/* --- TABS SECTION --- */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <TabButton
                id="description"
                label="Description"
                active={activeTab}
                onClick={setActiveTab}
              />

              {/* ✅ UPDATED: Use hasAttributes check */}
              {hasAttributes && (
                <TabButton
                  id="specifications"
                  label="Specifications"
                  active={activeTab}
                  onClick={setActiveTab}
                />
              )}

              <TabButton
                id="reviews"
                label={`Reviews (${product.reviewCount})`}
                active={activeTab}
                onClick={setActiveTab}
              />
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
                  <p>{product.description}</p>
                </div>
              </div>
            )}

            {activeTab === "specifications" && hasAttributes && (
              <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4">
                <DynamicAttributesSection
                  attributes={product.attributes}
                  schema={categorySchema}
                />

                <div
                  className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-500 flex justify-between
"
                >
                  <span>SKU: {product.sku}</span>
                  <span>
                    Last Updated:{" "}
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <ReviewsSection productId={product.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </>
  );
}

function TrustBadge({ icon: Icon, label, color, bg }: any) {
  return (
    <div
      className="flex flex-col items-center text-center space-y-2 p-3 rounded-lg hover:bg-gray-50 tran
sition-colors"
    >
      <div
        className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center`}
      >
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <span className="text-xs font-semibold text-gray-700">{label}</span>
    </div>
  );
}

function TabButton({ id, label, active, onClick }: any) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
        active === id
          ? "border-purple-600 text-purple-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

function ReviewsSection({ productId }: { productId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => productService.getReviews(productId),
    staleTime: 1000 * 60 * 5,
  });

  const { reviews, pagination } = data || {
    reviews: [],
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-4 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center py-10">
        Failed to load reviews. Please try again.
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div
        className="text-gray-500 text-center py-10 bg-gray-50 rounded-xl border border-dashed border-g
ray-200"
      >
        No reviews yet. Be the first to review!
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {reviews.map((review: Review) => (
        <div
          key={review.id}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-shadow hover:sha
dow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-gray-900">
                {review.user?.name || "Anonymous"}
              </h4>
              <div className="flex mt-1">
                <StarRating rating={review.rating} />
              </div>
            </div>
            <span className="text-sm text-gray-400">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          {review.comment && (
            <p className="mt-4 text-gray-700 leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-200 rounded-2xl" />
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 w-3/4 rounded" />
          <div className="h-4 bg-gray-200 w-1/4 rounded" />
          <div className="h-12 bg-gray-200 w-1/3 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
        <Link
          href="/products"
          className="text-purple-600 hover:underline mt-4 block"
        >
          Back to Products
        </Link>
      </div>
    </div>
  );
}
