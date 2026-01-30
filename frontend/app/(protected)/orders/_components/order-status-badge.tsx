import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS = {
  PENDING: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "success",
  PAID: "success",
  CANCELLED: "destructive",
  REFUNDED: "default",
} as const;

export function OrderStatusBadge({ status }: { status: string }) {
  const variant =
    STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS] || "default";

  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
