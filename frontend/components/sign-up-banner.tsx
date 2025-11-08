"use client";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

export const SignUpBanner = () => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? (
    <section className="bg-purple-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to start shopping?
        </h2>
        <p className="text-xl mb-8 text-purple-100">
          Create an account and get exclusive deals
        </p>
        <Link
          href="/sign-up"
          className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
        >
          Sign Up Now
        </Link>
      </div>
    </section>
  ) : (
    <></>
  );
};
