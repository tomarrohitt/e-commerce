import {
  EventBusService,
  InvoiceEventType,
  OrderEventType,
  OrderPaidEvent,
} from "@ecommerce/common";
import { PdfGenerator } from "../services/pdf-generator";
import { prisma } from "../config/prisma";
import { S3Service } from "../services/s3-service";

export class InvoiceConsumer {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe<OrderPaidEvent["data"]>(
      "invoice-service-queue",
      [OrderEventType.PAID],
      async (event) => {
        await this.processInvoice(event.data);
      }
    );
  }

  private async processInvoice(data: OrderPaidEvent["data"]) {
    try {
      const existing = await prisma.invoice.findUnique({
        where: { orderId: data.orderId },
      });
      if (existing) {
        console.info(`[Invoice] Skipped duplicate for ${data.orderId}`);
        return;
      }

      const pdfBuffer = await PdfGenerator.generate({
        orderId: data.orderId,
        date: new Date(data.createdAt).toLocaleDateString(),
        customerName: data.userName,
        customerEmail: data.userEmail,
        totalAmount: data.totalAmount,
        items: data.items,
        address: data.shippingAddress,
      });

      const key = `invoices/${data.userId}/${data.orderId}.pdf`;
      const publicUrl = await S3Service.uploadInvoice(key, pdfBuffer);

      await prisma.$transaction(async (tx) => {
        await tx.invoice.create({
          data: {
            orderId: data.orderId,
            userId: data.userId,
            amount: data.totalAmount,
            pdfUrl: publicUrl,
            status: "COMPLETED",
          },
        });

        await tx.outboxEvent.create({
          data: {
            aggregateId: data.orderId,
            eventType: InvoiceEventType.GENERATED,
            payload: {
              orderId: data.orderId,
              invoiceUrl: publicUrl,
            },
          },
        });
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        console.warn(
          `[Invoice] Invoice already exists for order ${data.orderId}. Skipping.`
        );
        return;
      }
      console.error(`[Invoice] Failed for order ${data.orderId}`, error);
    }
  }
}
