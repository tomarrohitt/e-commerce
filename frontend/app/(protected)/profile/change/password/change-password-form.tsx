"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction } from "@/actions/auth";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
  Shield,
  Info,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const initialState = {
  success: false,
  message: "",
  errors: {
    currentPassword: "",
    newPassword: "",
  },
  inputs: {
    currentPassword: "",
    newPassword: "",
  },
};

export const ChangePasswordForm = () => {
  const [state, action, pending] = useActionState(
    changePasswordAction,
    initialState,
  );

  const router = useRouter();

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Password changed successfully", {
        id: "password-change-success",
      });

      router.push("/profile");
    } else if (state?.message && !state?.success) {
      toast.error(state.message, {
        id: "password-change-error",
      });
    }
  }, [state?.success, state?.message]);

  return (
    <div className="space-y-8">
      {state?.message && (
        <Alert
          className={`border-2 ${
            state.success
              ? "bg-green-50 border-green-200 text-green-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          {state.success ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <AlertDescription className="font-medium">
            {state.message}
          </AlertDescription>
        </Alert>
      )}

      <Alert className="bg-blue-50 border-blue-200">
        <Shield className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-900 text-sm">
          <strong className="font-semibold">Security reminder:</strong> After
          changing your password, you&apos;ll be logged out from all devices and
          need to sign in again.
        </AlertDescription>
      </Alert>

      {/* Helper Information */}
      <div className="bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">
              Password Requirements
            </h4>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span>8+ characters</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span>One uppercase</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span>One lowercase</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span>One number</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form ref={formRef} action={action} className="space-y-6">
        <Field className="gap-2">
          <FieldLabel
            className="text-sm font-semibold text-gray-900"
            htmlFor="currentPassword"
          >
            Current Password
          </FieldLabel>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <LockKeyhole className="w-5 h-5" />
            </div>
            <Input
              id="currentPassword"
              name="currentPassword"
              disabled={pending}
              // Only set default value if it's NOT a success (keep typed data on error)
              defaultValue={
                !state?.success ? state?.inputs.currentPassword : ""
              }
              type="password"
              placeholder="Enter your current password"
              className="pl-11 pr-11 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-600 transition-all"
            />
          </div>
          {state?.errors.currentPassword && (
            <FieldError className="flex items-center gap-1.5 text-xs mt-1">
              <AlertCircle className="w-3 h-3" />
              {state.errors.currentPassword}
            </FieldError>
          )}
        </Field>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-xs text-gray-500 font-medium">
              NEW PASSWORD
            </span>
          </div>
        </div>

        <Field className="gap-2">
          <FieldLabel
            className="text-sm font-semibold text-gray-900"
            htmlFor="newPassword"
          >
            New Password
          </FieldLabel>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <LockKeyhole className="w-5 h-5" />
            </div>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              disabled={pending}
              defaultValue={!state?.success ? state?.inputs.newPassword : ""}
              placeholder="Create a strong new password"
              className="pl-11 pr-11 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-600 transition-all"
            />
          </div>
          {state?.errors.newPassword && (
            <FieldError className="flex items-center gap-1.5 text-xs mt-1">
              <AlertCircle className="w-3 h-3" />
              {state.errors.newPassword}
            </FieldError>
          )}
        </Field>

        <div className="pt-4">
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 group"
          >
            {pending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Having trouble? Contact our{" "}
          <a
            href="/support"
            className="text-blue-600 hover:text-blue-700 font-medium underline"
          >
            support team
          </a>{" "}
          for assistance.
        </p>
      </div>
    </div>
  );
};
