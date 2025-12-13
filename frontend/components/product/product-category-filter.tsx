import { Category } from "@/types";

interface Props {
  categories: Category[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}

export function ProductCategoryFilter({
  categories,
  selectedSlug,
  onSelect,
}: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onSelect("")}
          className={`px-6 py-3 rounded-full font-semibold transition-all
          ${
            selectedSlug === ""
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
        `}
        >
          All Products
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.slug)}
            className={`px-6 py-3 rounded-full font-semibold transition-all
            ${
              selectedSlug === c.slug
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
