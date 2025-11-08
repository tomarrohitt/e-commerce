// src/app/(auth)/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth - E-commerce",
  description: "Sign in or create an account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-gradient-linear-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
