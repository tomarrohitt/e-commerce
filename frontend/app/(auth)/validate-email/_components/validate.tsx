"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon, Link2OffIcon } from "lucide-react";
import { validateToken } from "@/actions/auth";
import Link from "next/link";

type Status = "loading" | "success" | "error";

export const Validate = ({ token }: { token: string }) => {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    async function verify() {
      const success = await validateToken(token);
      setStatus(success ? "success" : "error");
    }
    verify();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
        <div className="size-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
          <div className="size-5 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
        </div>
        <h2 className="text-base font-medium text-gray-900 mb-1.5">
          Verifying your email
        </h2>
        <p className="text-sm text-gray-500">
          Hang tight — this only takes a moment.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
        <div className="size-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircleIcon className="size-6 text-green-600" />
        </div>
        <h2 className="text-base font-medium text-gray-900 mb-1.5">
          Email confirmed
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Your account is active. You can now browse and shop.
        </p>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white
                     text-sm font-medium py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
      <div className="size-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
        <Link2OffIcon className="size-6 text-red-500" />
      </div>
      <h2 className="text-base font-medium text-gray-900 mb-1.5">
        Verification failed
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        Your token may be expired or already used. Request a fresh link below.
      </p>

      <Link
        href="/"
        className="flex items-center justify-center gap-2 w-full border border-gray-200
          text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
};
