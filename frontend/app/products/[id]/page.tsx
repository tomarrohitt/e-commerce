import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductImageGallery } from "./_components/product-image-gallery";
import { AddToCartSection } from "./_components/add-to-cart-section";
import { WishlistButton } from "./_components/wishlist-button";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProduct } from "@/lib/services/product-cached";
import { notFound } from "next/navigation";
import { entranceAnim } from "@/lib/constants/enter-animation";
import { ProductTrustBadges } from "./_components/trust-badges";
import { ProductReviews } from "./_components/product-reviews";
import { ProductRating } from "./_components/product-rating";
import { ProductBreadcrum } from "./_components/product-breadcrum";
import { ProductPricing } from "./_components/product-pricing";
import { ProductSpecification } from "./_components/product-specification";
import { BackButtons } from "./_components/back-buttons";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    return notFound();
  }

  const hasAttributes =
    product.attributes && Object.keys(product.attributes).length > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <BackButtons
        name={product.name}
        category={{
          name: product.category?.name,
          slug: product.category?.slug,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />

          <div className="sticky top-8 h-fit space-y-8">
            <div className="space-y-4">
              <ProductBreadcrum
                name={product.name}
                category={product.category}
              />
              <ProductRating
                rating={product.rating}
                reviewCount={product.reviewCount}
              />
            </div>

            <ProductPricing
              price={product.price}
              stockQuantity={product.stockQuantity}
            />

            <p
              className={`text-gray-600 leading-relaxed text-lg ${entranceAnim} delay-200`}
            >
              {product.description}
            </p>

            <div className="space-y-6">
              <div className={`flex gap-4  ${entranceAnim} delay-300`}>
                <div className="flex-1">
                  <AddToCartSection
                    productId={product.id}
                    maxQuantity={product.stockQuantity}
                  />
                </div>
                <WishlistButton productId={product.id} />
              </div>

              <ProductTrustBadges />
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator className="my-8" />

            {hasAttributes && (
              <ProductSpecification
                attributeSchema={product.category?.attributeSchema}
                attributes={product.attributes}
                sku={product.sku}
                updatedAt={product.updatedAt}
              />
            )}

            <Separator className="my-8" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Customer Reviews ({product.rating})
                </h2>
                <ProductRating
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                />
              </div>

              <ProductReviews id={id} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
