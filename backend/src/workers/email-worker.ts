import { rabbitMq } from "../config/rabbitmq";
import { EventType, eventPublisher } from "../events/publisher";
import { logger } from "../utils/logger";
import emailService from "../service/email-service";

class EmailWorker {
  private queueName = "email.queue";
  private exchange = "ecommerce.events";

  async start() {
    const channel = rabbitMq.getChannel();
    await channel.assertQueue(this.queueName, {
      durable: true,
      deadLetterExchange: "dlq.exchange",
    });

    await channel.bindQueue(
      this.queueName,
      this.exchange,
      EventType.ORDER_CREATED
    );
    await channel.bindQueue(
      this.queueName,
      this.exchange,
      EventType.ORDER_CANCELLED
    );

    await channel.bindQueue(
      this.queueName,
      this.exchange,
      EventType.USER_REGISTERED
    );

    channel.consume(
      this.queueName,
      async (msg) => {
        if (!msg) return;
        try {
          const event = JSON.parse(msg.content.toString());
          await this.handleEvent(event);

          channel.ack(msg);
        } catch (error) {
          logger.error("Failed to process email event", { error });
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  }

  private async handleEvent(event: any) {
    switch (event.eventType) {
      case EventType.ORDER_CREATED:
        await emailService.sendOrderConfirmation(event);
        logger.info("Order confirmation email sent", {
          orderId: event.data.orderId,
        });
        break;
      case EventType.ORDER_CANCELLED:
        await emailService.sendOrderCancelledMail(event);
        logger.info("Order cancellation email sent", {
          orderId: event.data.orderId,
        });
        break;
      case EventType.USER_REGISTERED:
        await emailService.sendVerificationEmail(event);
        break;
      default:
        break;
    }
  }
}

async function main() {
  try {
    await rabbitMq.connect();
    await eventPublisher.initialize();
    const emailWorker = new EmailWorker();
    await emailWorker.start();
    logger.info("Email worker started");
  } catch (error) {
    logger.error("Failed to start email worker:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down email worker...");
  await rabbitMq.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down email worker...");
  await rabbitMq.close();
  process.exit(0);
});

main();
