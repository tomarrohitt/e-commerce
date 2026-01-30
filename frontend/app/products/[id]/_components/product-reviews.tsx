import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { StarRating } from "./start-rating";
import { Separator } from "@/components/ui/separator";
import { getReviews } from "@/lib/services/product-cached";

export const ProductReviews = async ({ id }: { id: string }) => {
  const { reviews } = await getReviews(id);
  if (reviews.length === 0) {
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </CardContent>
    </Card>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                    {review.user?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    {review.user?.name || "Anonymous"}
                  </p>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} size="small" />
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {review.comment && (
              <p className="text-gray-700 leading-relaxed ml-12">
                {review.comment}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
