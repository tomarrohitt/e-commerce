import { getCategories, getProducts } from "@/lib/api/product-cached";
import { ProductWrapper } from "./products-wrapper";
import ProductListClient from "@/components/pages/product-list-client";

type Props = {
  searchParams: Promise<{
    category?: string;
    sortBy: "price" | "rating" | "createdAt" | undefined;
    sortOrder: "asc" | "desc" | undefined;
    minPrice?: number;
    maxPrice?: number;
    q?: string;
    page?: number;
  }>;
};

export default async function ProductsPage(props: Props) {
  const searchParams = await props.searchParams;
  const { q, page, category, sortBy, sortOrder, minPrice, maxPrice } =
    searchParams;

  const categories = await getCategories();
  const categoryId = categories.find((c) => c.slug === category)?.id;
  const { products, pagination } = await getProducts({
    limit: 40,
    search: q,
    categoryId,
    page,
    sortBy,
    sortOrder,
    minPrice,
    maxPrice,
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-orange-50 to-slate-100">
      <ProductWrapper>
        <ProductListClient
          initialProducts={products}
          categories={categories}
          pagination={pagination}
        />
      </ProductWrapper>
    </div>
  );
}
