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
        toast.error("Failed to send email");
      } else {
        toast.success("Verification email sent");
        setTimeLeft(COOLDOWN_TIME);
      }
    });
  };

  const isDisabled = pending || timeLeft > 0;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-200 w-full",
        !isDisabled &&
          "bg-white text-blue-700 border-white hover:bg-blue-50 active:scale-[0.98] shadow-lg shadow-black/10",
        isDisabled &&
          "bg-white/10 text-white/30 border-white/15 cursor-not-allowed",
      )}
      onClick={handleResend}
      disabled={isDisabled}
    >
      <RefreshCw
        className={cn("h-4 w-4 mr-2 shrink-0", {
          "animate-spin": pending,
        })}
      />
      {pending
        ? "Sending…"
        : timeLeft > 0
          ? `Resend in ${timeLeft}s`
          : "Resend verification email"}
    </button>
  );
};
