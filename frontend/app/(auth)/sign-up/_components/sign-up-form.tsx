"use client";

import { useActionState } from "react";

import { register } from "@/actions/auth";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const initialState = {
  success: false,
  message: "",
  errors: {
    name: "",
    email: "",
    password: "",
  },
  inputs: {
    name: "",
    email: "",
    password: "",
  },
};

export const SignUpForm = () => {
  const [state, action, pending] = useActionState(register, initialState);

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

      <Field className="gap-0">
        <FieldLabel className="mb-1" htmlFor="name">
          Full name
        </FieldLabel>
        <Input
          id="name"
          name="name"
          type="text"
          disabled={pending}
          defaultValue={state.inputs.name}
          placeholder="John Doe"
        />
        <FieldError className="my-1 text-xs">{state.errors.name}</FieldError>
      </Field>

      <Field className="gap-0">
        <FieldLabel className="mb-1" htmlFor="email">
          Email address
        </FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          disabled={pending}
          defaultValue={state.inputs.email}
          placeholder="you@example.com"
        />
        <FieldError className="my-1 text-xs">{state.errors.email}</FieldError>
      </Field>

      <Field className="gap-0">
        <FieldLabel className="mb-1" htmlFor="password">
          Password
        </FieldLabel>
        <Input
          id="password"
          name="password"
          type="password"
          disabled={pending}
          defaultValue={state.inputs.password}
          placeholder="••••••••••••••••"
        />
        <FieldError className="my-1 text-xs">
          {state.errors.password}
        </FieldError>
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-70 flex items-center justify-center"
      >
        {pending ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </button>
    </form>
  );
};
