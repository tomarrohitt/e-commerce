"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, KeyRound, Mail, Loader2 } from "lucide-react";

import { authService } from "@/lib/api";
import { ApiError } from "@/types"; // Assuming you have this type defined

// 1. Validation Schema
const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  // 2. Form Setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues, // To show the email in the success screen
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // 3. Mutation Setup
  const {
    mutate: sendResetLink,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: (data: ForgotPasswordInput) =>
      authService.forgotPassword(data.email),
    onSuccess: () => {
      toast.success("Reset link sent!");
    },
    onError: (error: any) => {
      const apiError = error as ApiError;
      toast.error(
        apiError.error || "Failed to send reset link. Please try again.",
      );
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    sendResetLink(data);
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mb-6 animate-pulse">
          <Mail className="h-8 w-8 text-purple-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Check your email
        </h1>

        <p className="text-gray-600 mb-8">
          We sent a password reset link to <br />
          <span className="font-semibold text-gray-900">
            {getValues("email")}
          </span>
        </p>

        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 mb-8 border border-gray-100">
          <p>
            Didn't receive the email? Check your spam folder or try another
            email address.
          </p>
        </div>

        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-4">
          <KeyRound className="h-6 w-6 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Forgot password?
        </h1>
        <p className="text-gray-600">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            disabled={isPending}
            placeholder="Enter your email"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-purple-500"
            } focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
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
              Sending Link...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/sign-in"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign in
        </Link>
      </div>
    </div>
  );
}
