import { rabbitMq } from "../config/rabbitmq";
import { logger } from "../utils/logger";
import { eventPublisher } from "../events/publisher";
import PDFDocument from "pdfkit";
import { config } from "../config";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { EventType, OrderPaidEvent } from "../events/publisher";
import orderRepository from "../repository/order-repository";

class InvoiceWorker {
  private queueName = "invoice.queue";
  private exchange = "ecommerce.events";

  async start() {
    const channel = rabbitMq.getChannel();
    await channel.assertQueue(this.queueName, { durable: true });

    await channel.bindQueue(
      this.queueName,
      this.exchange,
      EventType.ORDER_PAID
    );

    await channel.prefetch(1);

    channel.consume(
      this.queueName,
      async (msg) => {
        if (!msg) return;
        try {
          const event = JSON.parse(msg.content.toString());

          logger.info("Processing invoice for order: ", event.data.orderId);

          await this.generateInvoice(event);

          channel.ack(msg);
        } catch (error) {
          console.error("Failed to process invoice event", { error });
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  }

  private async generateInvoice(event: OrderPaidEvent) {
    const { orderId, userId } = event.data;

    const order = await orderRepository.findOrderForEvent(orderId);
    if (!order) {
      logger.error(`Order not found: ${orderId}`, { orderId });
      return;
    }

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    return new Promise(async (resolve, reject) => {
      doc.on("end", async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);

          // Upload to S3
          const key = `invoices/${userId}/${orderId}.pdf`;
          await config.s3Client.send(
            new PutObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME!,
              Key: key,
              Body: pdfBuffer,
              ContentType: "application/pdf",
            })
          );

          const invoiceUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

          logger.info(`✅ Invoice generated and uploaded: ${key}`, {
            orderId,
            invoiceUrl,
          });

          await orderRepository.updateInvoiceUrl(orderId, invoiceUrl);

          resolve(true);
        } catch (error) {
          logger.error(`Failed to upload invoice`, { error, orderId });
          reject(error);
        }
      });

      // Generate PDF content
      this.generateInvoicePDF(doc, order);

      doc.end();
    });
  }

  private generateInvoicePDF(doc: PDFKit.PDFDocument, order: any): void {
    const {
      orderId,
      user: { name, email },
      totalAmount,
    } = order;

    // Header
    doc
      .fillColor("#9333ea")
      .fontSize(26)
      .text("INVOICE", { align: "center" })
      .moveDown();

    // Company Info (placeholder)
    doc
      .fillColor("#000")
      .fontSize(10)
      .text("Your Company Name", { align: "right" })
      .text("123 Business St", { align: "right" })
      .text("City, State 12345", { align: "right" })
      .moveDown();

    // Invoice Details
    doc
      .fontSize(12)
      .text(`Invoice Number: ${orderId}`)
      .text(`Date: ${new Date().toLocaleDateString()}`)
      .text(`Customer Name: ${name}`)
      .text(`Customer Email: ${email}`)
      .moveDown();

    // Line
    doc
      .strokeColor("#9333ea")
      .lineWidth(2)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown();

    // Amount
    doc
      .fontSize(16)
      .fillColor("#9333ea")
      .text(`Total Amount: $${totalAmount.toFixed(2)}`, { align: "right" })
      .moveDown();

    // Footer
    doc
      .fontSize(10)
      .fillColor("#666")
      .text("Thank you for your business!", { align: "center" })
      .text("For support, contact: support@yourcompany.com", {
        align: "center",
      });
  }
}

async function main() {
  try {
    await rabbitMq.connect();
    await eventPublisher.initialize();
    const invoiceWorker = new InvoiceWorker();
    await invoiceWorker.start();
    logger.info("Invoice worker started");
  } catch (error) {
    logger.error("Failed to start invoice worker:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down invoice worker...");
  await rabbitMq.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down invoice worker...");
  await rabbitMq.close();
  process.exit(0);
});

main();
