import type { Category } from "@/types";
import ProductPageClient from "@/components/pages/product-page-client";
import { serverCategoryService } from "@/lib/server-api";
import { SignUpBanner } from "@/components/sign-up-banner";

export default async function HomePage() {
  const categoriesData = await serverCategoryService.getCategories();
  const categories: Category[] = categoriesData.categories;

  return (
    <div className="min-h-full bg-gray-50">
      <ProductPageClient categories={categories} />
      <SignUpBanner />
    </div>
  );
}
