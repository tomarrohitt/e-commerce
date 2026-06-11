import { ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { ForgotPasswordForm } from "./_components/forgot-password-form";

const ForgotPasswordPage = () => {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 border border-white/20 mb-4">
          <KeyRound className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Forgot password?
        </h1>
        <p className="text-blue-200 text-sm mt-1.5 leading-relaxed">
          No worries — we&apos;ll send reset instructions to your inbox.
        </p>
      </div>

      <ForgotPasswordForm />

      <div className="mt-8 text-center">
        <Link
          href="/sign-in"
          className="inline-flex items-center text-sm font-medium text-blue-200 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
