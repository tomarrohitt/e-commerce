import { createReviewAction } from "@/actions/review";
import { Button } from "@/components/ui/button";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star } from "lucide-react";
import React, {
  Dispatch,
  SetStateAction,
  useActionState,
  useEffect,
} from "react";
import { toast } from "sonner";

const initialState = {
  success: false,
  message: "",
  errors: {
    rating: "",
    comment: "",
    productId: "",
  },
  inputs: {
    rating: 5,
    comment: "",
    productId: "",
  },
};

export const CreateReviewForm = ({
  productId,
  setOpen,
}: {
  productId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [state, action, pending] = useActionState(
    createReviewAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Review Posted");
      setOpen(false);
    }
  }, [state.success]);
  return (
    <form action={action} className="space-y-6">
      {state.message && (
        <div
          className={`p-4 rounded-md text-sm ${
            state.success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      )}
      <Input
        className="opacity-0"
        value={productId}
        name="productId"
        type="hidden"
      />
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-row-reverse justify-center gap-1 group">
          {[5, 4, 3, 2, 1].map((star) => (
            <React.Fragment key={star}>
              <input
                type="radio"
                id={`rating-${star}`}
                name="rating"
                value={star}
                defaultChecked={star === 5}
                className="peer sr-only"
              />
              <Label
                htmlFor={`rating-${star}`}
                className="cursor-pointer p-1 transition-transform hover:scale-110 text-muted-foreground/30 fill-transparent
peer-checked:text-yellow-400 peer-checked:fill-yellow-400 peer-checked:[&~label]:text-yellow-400 peer-checked:[&~label]:fill-yellow-400

                  hover:text-yellow-400 hover:fill-yellow-400
                  hover:[&~label]:text-yellow-400 hover:[&~label]:fill-yellow-400"
              >
                <Star className="w-8 h-8 pointer-events-none fill-inherit" />
              </Label>
            </React.Fragment>
          ))}
        </div>
      </div>

      <Field>
        <Label htmlFor="comment">Your thoughts</Label>
        <Textarea
          name="comment"
          id="comment"
          placeholder="Tell us what you liked or disliked..."
          className="resize-none min-h-25"
          defaultValue={state?.inputs.comment as string}
          disabled={pending}
        />
        <FieldError className="my-1 text-xs">{state.errors.comment}</FieldError>
      </Field>
      <DrawerFooter className="px-0">
        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Review
        </Button>
        <DrawerClose asChild>
          <Button variant="outline" className="w-full">
            Cancel
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </form>
  );
};
