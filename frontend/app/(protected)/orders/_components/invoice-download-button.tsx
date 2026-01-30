"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { downloadInvoice } from "@/actions/order";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InvoiceButtonProps {
  orderId: string;
  className: string;
}

export const InvoiceDownloadButton = ({
  orderId,
  className,
}: InvoiceButtonProps) => {
  const [pending, startTransition] = useTransition();

  const handleInvoiceDownload = () => {
    startTransition(async () => {
      try {
        const url = await downloadInvoice(orderId);

        if (!url) {
          throw new Error("Invoice URL not found");
        }
        const link = document.createElement("a");
        link.href = url;

        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Invoice downloaded successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to download invoice. Please try again.");
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleInvoiceDownload}
      disabled={pending}
      className={className}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span>{pending ? "Downloading..." : "Download Invoice"}</span>
    </Button>
  );
};
