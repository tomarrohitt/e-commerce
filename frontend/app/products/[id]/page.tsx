import Link from "next/link";
import {
  Star,
  Truck,
  Shield,
  RefreshCw,
  Check,
  ChevronLeft,
} from "lucide-react";
import { ProductImageGallery } from "./product-image-gallery";
import { AddToCartSection } from "./add-to-cart-section";
import { WishlistButton } from "./wishlist-button";
import { AttributeRenderer } from "./attribute-rendered";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getProduct } from "@/lib/api/product-cached";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    return notFound();
  }

  const reviews = [
    {
      id: "1",
      rating: 5,
      comment: "Perfect fit for my windshield! Keeps the car cool on hot days.",
      user: { name: "David Miller" },
      createdAt: "2026-01-15T10:30:00.000Z",
    },
    {
      id: "2",
      rating: 4,
      comment: "Good quality material, easy to install and remove.",
      user: { name: "Lisa Anderson" },
      createdAt: "2026-01-14T14:20:00.000Z",
    },
    {
      id: "3",
      rating: 4,
      comment: "Works great! Slight wrinkles but doesn't affect performance.",
      user: { name: "James Wilson" },
      createdAt: "2026-01-12T09:15:00.000Z",
    },
  ];

  const discountPercentage = 25;
  const originalPrice = Number(product.price) * (1 + discountPercentage / 100);
  const hasAttributes =
    product.attributes && Object.keys(product.attributes).length > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href="/products"
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              Products
            </Link>
            {product.category && (
              <>
                <span className="text-gray-400">/</span>
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery - Client Component */}
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />

          {/* Product Info */}
          <div className="sticky top-8 h-fit space-y-8">
            {/* Header Section */}
            <div className="space-y-4">
              {product.category && (
                <Badge variant="secondary" className="text-xs mb-2">
                  {product.category.name}
                </Badge>
              )}

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <StarRating rating={product.rating} />
                  <span className="font-semibold text-gray-900 ml-1">
                    {product.rating}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-5" />
                <span className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">
                  {product.reviewCount} reviews
                </span>
              </div>
            </div>

            {/* Price & Stock Section */}
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  ${Number(product.price).toFixed(2)}
                </span>
                <span className="text-lg text-gray-400 line-through mb-1">
                  ${originalPrice.toFixed(2)}
                </span>
                <Badge variant="destructive" className="mb-2">
                  {discountPercentage}% OFF
                </Badge>
              </div>

              {product.stockQuantity > 0 ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full text-sm">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">
                    In Stock ({product.stockQuantity} available)
                  </span>
                </div>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            {/* Short Description (Removed the Card wrapper for a cleaner look) */}
            <p className="text-gray-600 leading-relaxed text-lg">
              {product.description}
            </p>

            {/* Actions */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <AddToCartSection
                    productId={product.id}
                    maxQuantity={product.stockQuantity}
                  />
                </div>
                <WishlistButton productId={product.id} />
              </div>

              {/* Trust Badges - Made slightly more subtle */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t">
                <TrustBadge
                  icon={Truck}
                  label="Free Shipping"
                  color="text-gray-600"
                  bg="bg-gray-50"
                />
                <TrustBadge
                  icon={RefreshCw}
                  label="Easy Returns"
                  color="text-gray-600"
                  bg="bg-gray-50"
                />
                <TrustBadge
                  icon={Shield}
                  label="Secure Payment"
                  color="text-gray-600"
                  bg="bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Card>
          <CardContent className="p-6 sm:p-8">
            {/* Description Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator className="my-8" />

            {/* Specifications Section */}
            {hasAttributes && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Specifications
                </h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-1">
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="font-semibold text-gray-900">SKU</span>
                        <span className="text-gray-700">{product.sku}</span>
                      </div>

                      {product.category?.attributeSchema?.map((schema) => {
                        const value = (
                          product.attributes as Record<string, any>
                        )[schema.key];
                        if (value === undefined || value === null) return null;

                        return (
                          <AttributeRenderer
                            key={schema.key}
                            attribute={schema}
                            value={value}
                          />
                        );
                      })}

                      <div className="flex justify-between py-3">
                        <span className="font-semibold text-gray-900">
                          Last Updated
                        </span>
                        <span className="text-gray-700">
                          {new Date(product.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Separator className="my-8" />

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Customer Reviews ({product.rating})
                </h2>
                <div className="flex items-center gap-2">
                  <StarRating rating={product.rating} />
                  <span className="font-semibold text-gray-900">
                    {product.rating}
                  </span>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                {review.user?.name?.charAt(0) || "A"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">
                                {review.user?.name || "Anonymous"}
                              </p>
                              <div className="flex items-center gap-2">
                                <StarRating
                                  rating={review.rating}
                                  size="small"
                                />
                                <Separator
                                  orientation="vertical"
                                  className="h-4"
                                />
                                <span className="text-sm text-gray-500">
                                  {new Date(
                                    review.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 leading-relaxed ml-12">
                            {review.comment}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">
                      No reviews yet. Be the first to review!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StarRating({
  rating,
  size = "normal",
}: {
  rating: number;
  size?: "small" | "normal";
}) {
  const sizeClass = size === "small" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : i < rating
                ? "fill-yellow-200 text-yellow-400"
                : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function TrustBadge({
  icon: Icon,
  label,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      className={`${bg} rounded-xl p-4 text-center transition-transform hover:scale-105`}
    >
      <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
      <p className={`text-xs font-semibold ${color}`}>{label}</p>
    </div>
  );
}
