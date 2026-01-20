"use client";
import { setDefaultAddress } from "@/actions/address";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export const SetToDefaultButton = ({
  userId,
  addressId,
}: {
  userId: string;
  addressId: string;
}) => {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSetToDefault = async () => {
    startTransition(async () => {
      await setDefaultAddress(addressId, userId);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleSetToDefault}
      disabled={pending}
      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
    >
      {pending ? (
        <Spinner className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <CheckCircle className="w-4 h-4" />
          Set as Default
        </>
      )}
    </button>
  );
};
