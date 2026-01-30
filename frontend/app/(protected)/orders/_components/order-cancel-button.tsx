"use client";
import { Spinner } from "@/components/ui/spinner";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cancelOrder } from "@/actions/order";
import { useRouter } from "next/navigation";

export const OrderCancelButton = ({ orderId }: { orderId: string }) => {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleCancelOrder = async () => {
    startTransition(async () => {
      await cancelOrder(orderId);
      router.refresh();
    });
  };

  return (
    <Button
      onClick={handleCancelOrder}
      disabled={pending}
      className="
      w-35
        inline-flex items-center justify-center gap-2
        px-4 py-2 text-sm font-semibold
        text-red-600 bg-red-50
        rounded-lg
        transition-all duration-150
        hover:bg-red-100 hover:text-red-700
        active:scale-95 active:shadow-none
        focus:outline-none focus:ring-2 focus:ring-red-300
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-50 disabled:hover:shadow-none
      "
    >
      {pending ? (
        <Spinner className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Trash2 className="size-4" />
          Cancel Order
        </>
      )}
    </Button>
  );
};
