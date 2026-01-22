import { memo } from "react";
import { ProductListProduct } from "@/types";
import ProductCard from "../product-card";

const MemoizedProductCard = memo(ProductCard);

export const ProductGrid = memo(
  ({ products }: { products: ProductListProduct[] }) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <MemoizedProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  },
);

ProductGrid.displayName = "ProductGrid";
