import Link from "next/link";
import { SignInForm } from "./_components/sign-in-form";
import { Suspense } from "react";
import Loading from "./_components/loading";

export default function SignInPage() {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 border border-white/20 mb-4">
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Welcome back
        </h1>
        <p className="text-blue-200 mt-1.5 text-sm">
          Sign in to continue shopping
        </p>
      </div>

      <Suspense fallback={<Loading />}>
        <SignInForm />
      </Suspense>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-transparent text-blue-200/80 font-medium">
            New here?
          </span>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/sign-up"
          className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl border border-white/25 text-white text-sm font-semibold hover:bg-white/10 transition-colors duration-200"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
