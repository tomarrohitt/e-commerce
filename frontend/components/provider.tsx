"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth-context"; // 1. Import
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/contexts/cart-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000 * 60,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="bottom-right" />
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
