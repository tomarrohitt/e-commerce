"use client";

import { useActionState } from "react";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

import { forgotPasswordAction as forgotPassword } from "@/actions/auth";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState = {
  success: false,
  message: "",
  errors: {
    email: "",
  },
  inputs: {
    email: "",
  },
};

export const ForgotPasswordForm = () => {
  const [state, action, pending] = useActionState(forgotPassword, initialState);

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
          {state.success ? (
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
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

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-white text-blue-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:bg-blue-50 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-black/10 mt-1"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Sending instructions…
          </>
        ) : (
          "Send reset link"
        )}
      </button>
    </form>
  );
};
