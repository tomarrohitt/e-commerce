"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function PaymentPendingPoller() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 2000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-linear-to-br from-blue-50 via-white to-blue-50">
      <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
        <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-gray-900">
          Preparing Payment
        </h2>
        <p className="text-gray-500">
          We are securely creating your payment session. This will just take a
          moment...
        </p>
      </div>
    </div>
  );
}
