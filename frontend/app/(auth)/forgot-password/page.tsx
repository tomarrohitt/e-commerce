import { ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { ForgotPasswordForm } from "./_components/forgot-password-form";

const ForgotPasswordPage = () => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
          <KeyRound className="h-6 w-6 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Forgot password?
        </h1>
        <p className="text-gray-500">
          No worries, we&apos;ll send you reset instructions.
        </p>
      </div>
      <ForgotPasswordForm />
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
};

export default ForgotPasswordPage;
