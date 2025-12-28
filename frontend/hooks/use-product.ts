"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/lib/api";

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
    retry: 1,
    staleTime: 1000 * 60 * 10,
  });
}
