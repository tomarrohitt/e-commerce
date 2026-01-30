"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Mail, LockKeyhole, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { entranceAnim } from "@/lib/constants/enter-animation";

const changeEmailAction = async (prevState: any, formData: FormData) => {
  return prevState;
};

export const ChangeEmailForm = () => {
  return (
    <div className="space-y-8">
      <Alert
        className={`bg-amber-50 border-amber-200 ${entranceAnim} delay-200`}
      >
        <Info className="h-5 w-5 text-amber-600" />
        <AlertDescription className="text-amber-900 text-sm">
          <strong className="font-semibold">Important:</strong> We&apos;ll send
          a verification link to your new email. The change won&apos;t take
          effect until you verify it.
        </AlertDescription>
      </Alert>

      {/* Form */}
      <form className="space-y-6">
        {/* New Email */}
        <Field className={`gap-2 ${entranceAnim} delay-300`}>
          <FieldLabel
            className="text-sm font-semibold text-gray-900"
            htmlFor="newEmail"
          >
            New Email Address
          </FieldLabel>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <Input
              id="newEmail"
              name="newEmail"
              type="email"
              placeholder="Enter your new email address"
              className="pl-11 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-600 transition-all"
            />
          </div>
        </Field>

        {/* Password Confirmation */}
        <Field className={`gap-2 ${entranceAnim} delay-400`}>
          <FieldLabel
            className="text-sm font-semibold text-gray-900"
            htmlFor="password"
          >
            Confirm with Password
          </FieldLabel>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <LockKeyhole className="w-5 h-5" />
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password to confirm"
              className="pl-11 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-600 transition-all"
            />
          </div>
        </Field>

        <div className={`pt-4 ${entranceAnim} delay-500`}>
          <button
            type="submit"
            className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 group"
          >
            <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Update Email Address</span>
          </button>
        </div>
      </form>

      {/* Verification Steps */}
      <div className="pt-4 border-t border-gray-200 space-y-4">
        <h4 className="font-semibold text-gray-900 text-sm">
          What happens next?
        </h4>
        <ol className="space-y-2.5">
          {[
            "We'll send a verification email to your new address",
            "Click the verification link in that email within 15 minutes",
            "Your email will be updated once verified",
            "You'll receive confirmations at your new email address",
          ].map((step, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-sm text-gray-600"
            >
              <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mt-0.5">
                {index + 1}
              </div>
              <span className="flex-1 pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
