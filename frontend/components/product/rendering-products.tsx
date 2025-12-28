import { ProductListProduct } from "@/types";
import { NoProductsFound } from "./no-products-found";
import { ProductGrid } from "./product-grid";
import { ProductsPageSkeleton } from "@/app/products/page";

type RenderingProductsProps = {
  products: ProductListProduct[];
  isLoading: boolean;
};

export function RenderingProducts({
  products,
  isLoading,
}: RenderingProductsProps) {
  return (
    <>
      {isLoading ? (
        <ProductsPageSkeleton />
      ) : products.length === 0 ? (
        <NoProductsFound />
      ) : (
        <ProductGrid products={products} />
      )}
    </>
  );
}
