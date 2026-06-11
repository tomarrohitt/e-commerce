import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { ResendMailButton } from "./_components/resend-mail-button";

interface PageProps {
  searchParams: Promise<{
    email: string;
  }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { email } = await searchParams;

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 border border-white/20 mb-5 animate-pulse">
          <Mail className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
          Check your inbox
        </h1>
        <p className="text-blue-200 text-sm leading-relaxed mb-1">
          We sent a verification link to
        </p>
        <p className="font-semibold text-white text-sm mb-7 truncate px-4">
          {email || "your email address"}
        </p>

        <div className="p-5 bg-white/10 rounded-2xl border border-white/15 mb-7 text-left">
          <p className="text-sm text-blue-200 mb-3">
            Didn&apos;t get it? Check your spam folder or request a new one.
          </p>
          <ResendMailButton email={email} />
        </div>

        <Link
          href="/sign-in"
          className="inline-flex items-center text-sm font-medium text-blue-200 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to sign in
        </Link>
      </div>

      <p className="text-center text-xs text-blue-300/60 mt-7 pt-7 border-t border-white/10">
        Wrong email?{" "}
        <Link
          href="/sign-up"
          className="text-blue-200 hover:text-white font-medium"
        >
          Create a new account
        </Link>
      </p>
    </div>
  );
}
