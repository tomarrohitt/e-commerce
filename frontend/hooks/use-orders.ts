import { useAuth } from "@/contexts/auth-context";
import { QUERY_KEYS, CACHE_TIMES } from "@/lib/query-config";
import { useOptimizedQuery } from "./use-optimized-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Order } from "@/types";
import { getOrders, cancelOrderFunction } from "@/lib/api";

export function useOrders() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useOptimizedQuery({
    queryKey: QUERY_KEYS.orders({ limit: 10 }),
    queryFn: () => getOrders({ limit: 10 }),
    cacheTime: CACHE_TIMES.orders, // ✅ 5 minutes instead of 0
    enabled: isAuthenticated,
  });

  // ✅ Optimistic update for cancel
  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: (orderId: string) => cancelOrderFunction(orderId),
    onMutate: async (orderId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.orders() });

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData(QUERY_KEYS.orders());

      // Optimistically update
      queryClient.setQueryData(QUERY_KEYS.orders(), (old: any) => ({
        ...old,
        orders: old?.orders.map((order: Order) =>
          order.id === orderId ? { ...order, status: "CANCELLED" } : order,
        ),
      }));

      return { previousOrders };
    },
    onError: (err, orderId, context) => {
      // Rollback on error
      queryClient.setQueryData(QUERY_KEYS.orders(), context?.previousOrders);
      toast.error("Failed to cancel order");
    },
    onSuccess: () => {
      toast.success("Order cancelled successfully");
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders() });
    },
  });

  const downloadInvoice = async (orderId: string) => {
    try {
      const url = await downloadInvoice(orderId);
      window.open(url, "_blank");
    } catch (error: any) {
      toast.error(error.error || "Failed to download invoice");
    }
  };

  return {
    orders: data?.orders || [],
    isLoading,
    cancelOrder,
    isCancelling,
    downloadInvoice,
  };
}
