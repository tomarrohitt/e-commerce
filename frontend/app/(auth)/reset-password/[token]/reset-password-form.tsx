"use client";

import { useActionState } from "react";

import { Loader2 } from "lucide-react";

import { resetPasswordAction as resetPassword } from "@/actions/auth";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState = {
  success: false,
  message: "",
  errors: {
    newPassword: "",
  },
  inputs: {
    newPassword: "",
  },
};

export const ResetPasswordForm = ({ token }: { token: string }) => {
  const [state, action, pending] = useActionState(
    resetPassword.bind(null, token),
    initialState,
  );
  return (
    <form action={action} className="space-y-6">
      {state.message && !state.success && (
        <div className="p-4 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
          {state.message}
        </div>
      )}

      <Field className="gap-0">
        <FieldLabel className="mb-1" htmlFor="newPassword">
          New Password
        </FieldLabel>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          disabled={pending}
          defaultValue={state.inputs.newPassword}
          placeholder="••••••••"
        />
        <FieldError className="my-1 text-xs">
          {state.errors.newPassword}
        </FieldError>
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {pending ? (
          <>
            <Loader2 className="size-5 mr-2 animate-spin" />
            Updating password...
          </>
        ) : (
          "Set New Password"
        )}
      </button>
    </form>
  );
};
