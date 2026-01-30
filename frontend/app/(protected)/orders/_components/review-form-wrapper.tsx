import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CreateReviewForm } from "./create-review-form";
import { getReviewByProductId } from "@/lib/services/product-cached";
import { UpdateReviewForm } from "./update-review-form";

const ReviewFormWrapper = ({
  productId,
  setOpen,
}: {
  productId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [review, setReview] = useState<{
    id: string;
    comment: string;
    rating: number;
  } | null>(null);

  useEffect(() => {
    async function fetchReview() {
      const review = await getReviewByProductId(productId);
      if (review !== null) setReview(review);
    }
    fetchReview();
  }, [productId]);

  if (!review) {
    return <CreateReviewForm productId={productId} setOpen={setOpen} />;
  }

  return (
    <UpdateReviewForm productId={productId} setOpen={setOpen} review={review} />
  );
};

export default ReviewFormWrapper;
