import { Category } from "@/types";

type NoProductsFoundType = {
  categories?: Category[];
  categorySlug?: string;
  selectedCategory?: Category | null;
};

export function NoProductsFound({
  categories,
  selectedCategory,
  categorySlug,
}: NoProductsFoundType) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg">
        No products found.
        {categorySlug
          ? !selectedCategory && categories && categories.length > 0
            ? " That category was not found."
            : " Try a different search or category."
          : ""}
      </p>
    </div>
  );
}
