"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { login } from "@/actions/auth";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";

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
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [state, action, pending] = useActionState(
    login.bind(null, redirectTo),
    initialState,
  );

  return (
    <form action={action} className="space-y-5">
      {state.message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl text-sm border ${
            state.success
              ? "bg-emerald-500/15 text-emerald-100 border-emerald-400/30"
              : "bg-red-500/15 text-red-100 border-red-400/30"
          }`}
        >
          {!state.success && (
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      <Field className="gap-0">
        <FieldLabel
          className="mb-1.5 text-sm font-medium text-blue-100"
          htmlFor="email"
        >
          Email address
        </FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          disabled={pending}
          defaultValue={state.inputs.email}
          placeholder="you@example.com"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/20 rounded-xl"
        />
        <FieldError className="mt-1.5 text-xs text-red-300">
          {state.errors.email}
        </FieldError>
      </Field>

      <Field className="gap-0">
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel
            htmlFor="password"
            className="text-sm font-medium text-blue-100"
          >
            Password
          </FieldLabel>
          <Link
            href="/forgot-password"
            className="text-xs text-blue-200 hover:text-white transition-colors font-medium"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          disabled={pending}
          defaultValue={state.inputs.password}
          placeholder="••••••••••••"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/20 rounded-xl"
        />
        <FieldError className="mt-1.5 text-xs text-red-300">
          {state.errors.password}
        </FieldError>
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-white text-blue-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:bg-blue-50 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center mt-2 shadow-lg shadow-black/10"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
};
