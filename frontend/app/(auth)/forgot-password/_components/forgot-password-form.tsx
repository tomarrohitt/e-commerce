"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

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
    <form action={action} className="space-y-6">
      {state.message && (
        <div
          className={`p-4 rounded-md text-sm ${
            state.success
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {state.message}
        </div>
      )}

      <Field className="gap-0">
        <FieldLabel className="mb-1" htmlFor="email">
          Email address
        </FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          disabled={pending}
          defaultValue={state.inputs.email}
          placeholder="Enter your email"
        />
        <FieldError className="my-1 text-xs">{state.errors.email}</FieldError>
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {pending ? (
          <>
            <Loader2 className="size-5 mr-2 animate-spin" />
            Sending instructions...
          </>
        ) : (
          "Reset Password"
        )}
      </button>
    </form>
  );
};
