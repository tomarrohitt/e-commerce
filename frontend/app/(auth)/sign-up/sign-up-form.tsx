"use client";

import { register } from "@/actions/auth";
import { useActionState } from "react";

export type RegisterState = {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  inputs?: {
    name: string;
    email: string;
  };
};

const initialState: RegisterState = {
  success: false,
  message: "",
  errors: {},
  inputs: {
    name: "",
    email: "",
  },
};

export const SignUpForm = () => {
  const [state, action, pending] = useActionState(register, initialState);

  return (
    <form action={action} className="space-y-6">
      {/* Global Error/Success Message */}
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
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Full Name
        </label>
        <input
          name="name"
          type="text"
          id="name"
          disabled={pending}
          // Default to previous input if validation fails
          defaultValue={state.inputs?.name}
          className={`w-full px-4 py-3 rounded-lg border ${
            state.errors?.name
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-purple-500"
          } focus:ring-2 focus:border-transparent transition-all duration-200`}
          placeholder="John Doe"
        />
        {/* Helper to show the first error message */}
        {state.errors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Email Address
        </label>
        <input
          name="email"
          type="email"
          id="email"
          disabled={pending}
          defaultValue={state.inputs?.email}
          className={`w-full px-4 py-3 rounded-lg border ${
            state.errors?.email
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-purple-500"
          } focus:ring-2 focus:border-transparent`}
          placeholder="you@example.com"
        />
        {state.errors?.email && (
          <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Password
        </label>
        <input
          name="password"
          type="password"
          id="password"
          disabled={pending}
          className={`w-full px-4 py-3 rounded-lg border ${
            state.errors?.password
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-purple-500"
          } focus:ring-2 focus:border-transparent`}
          placeholder="••••••••"
        />
        {state.errors?.password && (
          <p className="mt-1 text-sm text-red-600">
            {state.errors.password[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-70"
      >
        {pending ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
};
