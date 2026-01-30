import { Separator } from "@/components/ui/separator";
import { entranceAnim } from "@/lib/constants/enter-animation";
import { StarRating } from "./start-rating";

export const ProductRating = ({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) => {
  return (
    <div className={`flex items-center gap-4 ${entranceAnim} delay-100`}>
      <div className="flex items-center gap-1">
        <StarRating rating={rating} />
        <span className="font-semibold text-gray-900 ml-1">{rating}</span>
      </div>
      <Separator orientation="vertical" className="h-5" />
      <span className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">
        {reviewCount} reviews
      </span>
    </div>
  );
};
