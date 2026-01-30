"use client";

import { resendMailAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useTransition, useState, useEffect } from "react";
import { toast } from "sonner";

const COOLDOWN_TIME = 60;

export const ResendMailButton = ({ email }: { email: string }) => {
  const [pending, startTransition] = useTransition();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const handleResend = () => {
    if (timeLeft > 0) return;

    startTransition(async () => {
      const res = await resendMailAction(email);

      if (!res.success) {
        toast.error("Email Send Failed");
      } else {
        toast.success("Email Sent");
        setTimeLeft(COOLDOWN_TIME);
      }
    });
  };

  const isDisabled = pending || timeLeft > 0;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg border border-blue-200 transition-all",
        !isDisabled && "hover:bg-blue-100",
        isDisabled &&
          "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200",
      )}
      onClick={handleResend}
      disabled={isDisabled}
    >
      <RefreshCw
        className={cn("h-4 w-4 mr-2", {
          "animate-spin": pending,
        })}
      />
      {pending
        ? "Sending..."
        : timeLeft > 0
          ? `Resend in ${timeLeft}s`
          : "Click to resend"}
    </button>
  );
};
