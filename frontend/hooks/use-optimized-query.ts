import { CACHE_TIMES } from "@/lib/query-config";
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";

interface OptimizedQueryOptions<T>
  extends Omit<UseQueryOptions<T>, "queryKey" | "queryFn"> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  cacheTime?: number;
  enabled?: boolean;
}

// ✅ Centralized query configuration
export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  cacheTime = CACHE_TIMES.products,
  enabled = true,
  ...options
}: OptimizedQueryOptions<T>) {
  return useQuery<T>({
    queryKey,
    queryFn,
    enabled,
    staleTime: cacheTime,
    gcTime: cacheTime * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: 1,
    ...options,
  });
}
