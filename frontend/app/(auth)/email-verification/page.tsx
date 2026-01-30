import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { ResendMailButton } from "./_components/resend-mail-button";

interface PageProps {
  searchParams: Promise<{
    email: string;
  }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { email } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-20">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 tracking-tight">
          Verify your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg mx-20">
        <div className="bg-white py-12 px-8 shadow-2xl rounded-2xl ring-1 ring-black/5">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 mb-6 animate-pulse">
              <Mail className="h-10 w-10 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Check your inbox
            </h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              We&apos;ve sent a verification link to{" "}
              <span className="font-semibold text-gray-900 block mt-1">
                {email || "your email address"}
              </span>
            </p>
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 mb-8">
              <p className="text-sm text-gray-500 mb-3">
                Didn&apos;t receive the email? Check your spam folder or
              </p>

              <ResendMailButton email={email} />
            </div>

            <Link
              href="/sign-in"
              className="inline-flex items-center text-gray-500 hover:text-blue-500 font-medium transition-colors"
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Back to Sign In
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Entered the wrong email?{" "}
          <Link
            href="/sign-up"
            className="text-gray-500 underline hover:text-gray-900"
          >
            Create a new account
          </Link>
        </p>
      </div>
    </div>
  );
}
