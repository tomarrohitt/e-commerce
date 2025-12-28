"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // ✅ Added usePathname
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return null;
  }
  return (
    <div className="min-h-full bg-gray-50">
      <main>{children}</main>
    </div>
  );
}
