import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

export function useOrders() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading: isDataLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.getOrders({ limit: 10 }),
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      toast.error(error.error || "Failed to cancel order");
    },
  });

  const downloadInvoice = async (orderId: string) => {
    try {
      const url = await orderService.downloadInvoice(orderId);
      window.open(url, "_blank");
    } catch (error: any) {
      toast.error(error.error || "Failed to download invoice");
    }
  };

  return {
    orders: ordersData?.orders || [],
    isLoading: isAuthLoading || isDataLoading,
    cancelOrder,
    isCancelling,
    downloadInvoice,
  };
}
