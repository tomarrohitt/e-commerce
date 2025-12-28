"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation"; // ✅ use useParams for dynamic routes
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Lock, ArrowRight, Loader2, CheckCircle } from "lucide-react";

import { authService } from "@/lib/api";
import { ApiError } from "@/types";

// 1. Validation Schema
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
  const router = useRouter();

  // ✅ Get the token from the URL path: /reset-password/[token]
  const params = useParams<{ token: string }>();
  const token = params.token;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const {
    mutate: resetPassword,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: (data: ResetPasswordInput) =>
      authService.resetPassword({
        token, // Pass the token from URL
        newPassword: data.password,
      }),
    onSuccess: () => {
      toast.success("Password reset successfully!");
      setTimeout(() => router.push("/"), 1200);
    },
    onError: (error: any) => {
      const apiError = error as ApiError;
      toast.error(
        apiError.error || "Failed to reset password. Link may be expired.",
      );
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    resetPassword(data);
  };

  // ---------------------------------------------------------
  // VIEW 1: SUCCESS STATE
  // ---------------------------------------------------------
  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Password Reset!
        </h1>
        <p className="text-gray-600 mb-8">
          Your password has been successfully updated. You can now log in with
          your new credentials.
        </p>

        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Continue to Sign In
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------
  // VIEW 2: FORM STATE
  // ---------------------------------------------------------
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-4">
          <Lock className="h-6 w-6 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reset Password
        </h1>
        <p className="text-gray-600">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* New Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            New Password
          </label>
          <input
            {...register("password")}
            type="password"
            id="password"
            disabled={isPending}
            placeholder="••••••••"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-purple-500"
            } focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
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
            {...register("confirmPassword")}
            type="password"
            id="confirmPassword"
            disabled={isPending}
            placeholder="••••••••"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.confirmPassword
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-purple-500"
            } focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
              Resetting...
            </>
          ) : (
            "Set New Password"
          )}
        </button>
      </form>
    </div>
  );
}
