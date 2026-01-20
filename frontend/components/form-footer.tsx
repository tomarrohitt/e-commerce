import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface FormFooterProps {
  formId: string;
  pending?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

export function FormFooter({
  formId,
  pending = false,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
}: FormFooterProps) {
  return (
    <DialogFooter className="flex gap-3 sm:flex-row">
      <DialogClose asChild>
        <Button
          type="button"
          variant="outline"
          className="flex-1 bg-transparent cursor-pointer"
          disabled={pending}
        >
          {cancelLabel}
        </Button>
      </DialogClose>

      <Button
        type="submit"
        form={formId}
        className="flex-1 cursor-pointer"
        disabled={pending}
      >
        {pending ? <Spinner className="w-4 h-4 animate-spin" /> : submitLabel}
      </Button>
    </DialogFooter>
  );
}
