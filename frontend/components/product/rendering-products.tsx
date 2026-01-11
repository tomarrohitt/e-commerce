import { getProducts } from "@/lib/api/product-cached";
import { NoProductsFound } from "./no-products-found";
import { ProductGrid } from "./product-grid";

export default async function RenderingProducts() {
  const { products } = await getProducts({
    limit: 24,
  });

  if (products.length === 0) {
    return <NoProductsFound />;
  }

  return <ProductGrid products={products} />;
}
