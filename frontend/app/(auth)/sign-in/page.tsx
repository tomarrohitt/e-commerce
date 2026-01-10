import Link from "next/link";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your account to continue</p>
      </div>

      <SignInForm />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            Don't have an account?
          </span>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/sign-up"
          className="text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
