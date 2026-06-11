import Link from "next/link";
import { SignUpForm } from "./_components/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8">
      {/* Header */}
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
              d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Create account
        </h1>
        <p className="text-blue-200 mt-1.5 text-sm">
          Join us and start shopping today
        </p>
      </div>

      <SignUpForm />

      {/* Divider */}
      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-transparent text-blue-200/80 font-medium">
            Already a member?
          </span>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl border border-white/25 text-white text-sm font-semibold hover:bg-white/10 transition-colors duration-200"
        >
          Sign in instead
        </Link>
      </div>
    </div>
  );
}
