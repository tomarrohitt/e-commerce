import { Category } from "@/types";

interface Props {
  categories: Category[];
}

export function ProductCategoryFilter({ categories }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-3">
        <button>All Products</button>

        {categories.map((c) => (
          <button
            key={c.id}
            className="px-6 py-3 rounded-full font-semibold transition-all"
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
