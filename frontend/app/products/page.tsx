import ProductPageClient from "@/components/pages/product-list-page";
import { SignUpBanner } from "@/components/sign-up-banner";
import { serverCategoryService } from "@/lib/server-api";
import { Category } from "@/types";

export default async function ProductsPage() {
  const categoriesData = await serverCategoryService.getCategories();
  const categories: Category[] = categoriesData.categories;

  return (
    <div className="min-h-full bg-gray-50">
      <ProductPageClient categories={categories} />
      <SignUpBanner />
    </div>
  );
}
