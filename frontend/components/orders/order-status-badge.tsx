import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS = {
  PENDING: "warning",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "success",
  PAID: "success",
  CANCELLED: "danger",
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
