import { Product } from "@/types";
import { NoProductsFound } from "./no-products-found";
import { ProductCardSkeleton } from "./product-card-skeleton";
import { ProductGrid } from "./product-grid";

type RenderingProductsProps = {
  products: Product[];
  loading: boolean;
};

export function RenderingProducts({
  products,
  loading,
}: RenderingProductsProps) {
  return (
    <>
      {loading ? (
        <ProductCardSkeleton count={8} />
      ) : products.length === 0 ? (
        <NoProductsFound />
      ) : (
        <ProductGrid products={products} loading={loading} />
      )}
    </>
  );
}
