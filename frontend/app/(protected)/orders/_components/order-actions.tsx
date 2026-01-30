import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrderCancelButton } from "./order-cancel-button";
import { InvoiceDownloadButton } from "./invoice-download-button";

interface OrderActionsProps {
  orderId: string;
  status: string;
  invoiceUrl: string | null;
}

export function OrderActions({
  orderId,
  status,

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
        <Button variant="default">View Details</Button>
      </Link>
      {canCancel && <OrderCancelButton orderId={orderId} />}
      {invoiceUrl && (
        <InvoiceDownloadButton
          orderId={orderId}
          className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200 shadow-sm"
        />
      )}
    </div>
  );
}
