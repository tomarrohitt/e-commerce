import Link from "next/link";
import { z } from "zod";

import { Lock, ArrowRight, CheckCircle } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const isSuccess = false;

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Password Reset!
        </h1>
        <p className="text-gray-500 mb-8">
          Your password has been successfully updated. You can now log in with
          your new credentials.
        </p>

        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Continue to Sign In
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
          <Lock className="h-6 w-6 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reset Password
        </h1>
        <p className="text-gray-500">Enter your new password below.</p>
      </div>

      <form className="space-y-6">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            New Password
          </label>
          <input
            type="password"
            id="password"
            disabled={false}
            placeholder="••••••••"
          />
          {false && <p className="mt-1 text-sm text-red-500"></p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            disabled={false}
            placeholder="••••••••"
          />
          {false && <p className="mt-1 text-sm text-red-500"></p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
        >
          Set New Password
        </button>
      </form>
    </div>
  );
}
