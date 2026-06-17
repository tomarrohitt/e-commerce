import { Link2OffIcon } from "lucide-react";
import Link from "next/link";

export const NoToken = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
      <div className="size-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
        <Link2OffIcon className="size-6 text-red-500" />
      </div>
      <h2 className="text-base font-medium text-gray-900 mb-1.5">
        Invalid or missing link
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        This verification link isn&apos;t valid or has expired. Request a new
        one below.
      </p>
      <Link
        href="/"
        className="flex items-center justify-center gap-2 w-full border border-gray-200
          text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
      >
        Back to home
      </Link>
      <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50">
        Check your spam folder if you don&apos;t see it within a minute.
      </p>
    </div>
  );
};
