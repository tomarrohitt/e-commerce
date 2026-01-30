import Link from "next/link";
import { SignUpForm } from "./_components/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Account
        </h1>
        <p className="text-gray-500">Join us and start shopping today</p>
      </div>

      <SignUpForm />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            Already have an account?
          </span>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/sign-in"
          className="text-blue-500 hover:text-blue-700 font-semibold transition-colors duration-200"
        >
          Sign in instead
        </Link>
      </div>
    </div>
  );
}
