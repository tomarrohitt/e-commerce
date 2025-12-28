import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OrderActionsProps {
  orderId: string;
  status: string;
  invoiceUrl: string | null;
  onCancel: () => void;
  onDownloadInvoice: () => void;
  isCancelling: boolean;
}

export function OrderActions({
  orderId,
  status,
  onCancel,
  onDownloadInvoice,
  isCancelling,
  invoiceUrl,
}: OrderActionsProps) {
  const canCancel = ![
    "CANCELLED",
    "SHIPPED",
    "DELIVERED",
    "FAILED",
    "REFUNDED",
  ].includes(status);

  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <Link href={`/orders/${orderId}`}>
        <Button variant="primary">View Details</Button>
      </Link>
      {canCancel && (
        <Button variant="danger" onClick={onCancel} disabled={isCancelling}>
          {isCancelling ? "Cancelling..." : "Cancel Order"}
        </Button>
      )}
      {invoiceUrl && (
        <Button variant="secondary" onClick={onDownloadInvoice}>
          Download Invoice
        </Button>
      )}
    </div>
  );
}
