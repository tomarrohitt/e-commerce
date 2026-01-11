"use client";
import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/actions/auth";

const initialState = {
  success: false,
  message: "",
  errors: {
    email: "",
    password: "",
  },
  inputs: {
    email: "",
    password: "",
  },
};
export const SignInForm = () => {
  const [state, action, pending] = useActionState(login, initialState);
  return (
    <form action={action} className="space-y-6">
      {state.message && (
        <div
          className={`p-4 rounded-md text-sm ${
            state.success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email Address
        </label>
        <input
          name="email"
          id="email"
          type="email"
          autoComplete="email"
          disabled={pending}
          defaultValue={state?.inputs?.email}
          className={`w-full px-4 py-3 rounded-lg border ${
            state.errors?.email
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-purple-500"
          } focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
          placeholder="you@example.com"
        />
        {state.errors?.email && (
          <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-purple-600 hover:text-purple-700 transition-colors duration-200"
          >
            Forgot password?
          </Link>
        </div>
        <input
          name="password"
          id="password"
          type="password"
          disabled={pending}
          className={`w-full px-4 py-3 rounded-lg border ${
            state?.errors?.password
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-purple-500"
          } focus:ring-2 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
          defaultValue={state.inputs?.password}
          placeholder="•••••••••••••"
        />
        {state?.errors?.password && (
          <p className="mt-1 text-sm text-red-600">{state.errors.password} </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
      >
        {pending ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
};
