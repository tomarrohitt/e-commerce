"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { X, Star, Loader2 } from "lucide-react";
import { CreateReviewInput, ReviewTrim } from "@/types";
import { productService } from "@/lib/api";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productThumbnail?: string | null;
}

export function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  productThumbnail,
}: ReviewModalProps) {
  const queryClient = useQueryClient();

  const { data: existingReview, isLoading: isChecking } =
    useQuery<ReviewTrim | null>({
      queryKey: ["review-check", productId],
      queryFn: async () => productService.getReviewByProductId(productId),
      enabled: isOpen,
      staleTime: 0,
    });

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  useEffect(() => {
    if (!isChecking && existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || "");
    } else if (!isChecking && !existingReview) {
      setRating(5);
      setComment("");
    }
  }, [existingReview, isChecking, isOpen, productId]);

  const { mutate: submitReview, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: CreateReviewInput) => {
      if (existingReview) {
        return productService.updateReview({
          id: existingReview.id,
          rating,
          comment,
          createdAt: existingReview.createdAt,
        });
      } else {
        return productService.createReview({
          productId,
          rating,
          comment,
        });
      }
    },
    onSuccess: () => {
      toast.success(
        existingReview
          ? "Review updated successfully!"
          : "Review submitted successfully!",
      );
      queryClient.invalidateQueries({ queryKey: ["review-check"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit review");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }
    submitReview({ productId, rating, comment });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative min-h-[400px]">
        {/* Loading Overlay */}
        {isChecking ? (
          <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            <p className="text-gray-500 font-medium">
              Checking your review history...
            </p>
          </div>
        ) : (
          /* Form Content */
          <>
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {existingReview ? "Edit Your Review" : "Write a Review"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Product Display */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                  {productThumbnail ? (
                    <img
                      src={productThumbnail}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 line-clamp-2">
                    {productName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {existingReview
                      ? "You reviewed this previously"
                      : "Share your experience with this product"}
                  </p>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex flex-col items-center space-y-3 p-4 bg-linear-to-br from-purple-50 to-pink-50 rounded-xl">
                <span className="text-sm font-medium text-gray-600">
                  Rate your experience
                </span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-9 h-9 transition-all ${
                          star <= (hoveredStar ?? rating)
                            ? "fill-amber-400 text-amber-400 drop-shadow-md"
                            : "text-gray-300 fill-gray-100"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm font-semibold text-purple-600 h-5">
                  {rating === 5 && "⭐ Absolutely fantastic!"}
                  {rating === 4 && "😊 Very good quality"}
                  {rating === 3 && "😐 It was okay"}
                  {rating === 2 && "😕 Could be better"}
                  {rating === 1 && "😞 Disappointing"}
                </p>
              </div>

              {/* Comment Area */}
              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Review
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike? How was the quality?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all"
                  required
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 shadow-sm shadow-purple-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting
                    ? existingReview
                      ? "Updating..."
                      : "Submitting..."
                    : existingReview
                      ? "Update Review"
                      : "Submit Review"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
