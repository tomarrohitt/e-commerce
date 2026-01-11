import { ProductGrid } from "@/components/product/product-grid";
import { ProductCategoryFilter } from "@/components/product/product-category-filter";
import { Category, ProductListProduct } from "@/types";

export default function ProductListClient({
  initialProducts,
  categories,
}: {
  initialProducts: ProductListProduct[];
  categories: Category[];
}) {
  return (
    <>
      <section className="py-8">
        <ProductCategoryFilter categories={categories} />
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductGrid products={initialProducts} />
        </div>
      </section>
    </>
  );
}
