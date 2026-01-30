import { Star } from "lucide-react";

export function StarRating({
  rating,
  size = "normal",
}: {
  rating: number;
  size?: "small" | "normal";
}) {
  const sizeClass = size === "small" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : i < rating
                ? "fill-yellow-200 text-yellow-400"
                : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}
