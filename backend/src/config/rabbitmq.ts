import amqp, { Channel } from "amqplib";
import { logger } from "../utils/logger";
class RabbitMqConnection {
  // New types
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 5000;

  async connect() {
    try {
      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || "amqp://user:password@localhost:5672"
      );

      this.channel = await this.connection.createChannel();
      this.connection?.on("error", (err) => {
        logger.error("RabbitMQ connection error:", err);
        this.reconnect();
      });

      this.connection?.on("close", () => {
        logger.info("RabbitMQ connection closed");
        this.reconnect();
      });

      this.reconnectAttempts = 0;
    } catch (error) {
      logger.error("Failed to connect to RabbitMQ:", error);
      this.reconnect();
    }
  }

  private async reconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error("Max reconnection attempts reached. Exiting...");
      process.exit(1);
    }

    this.reconnectAttempts++;
    logger.info(
      `Reconnecting to RabbitMQ (attempt ${this.reconnectAttempts})...`
    );

    setTimeout(() => this.connect(), this.reconnectDelay);
  }

  async close() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      logger.info("RabbitMQ connection closed");
    } catch (error) {
      logger.error("Failed to close RabbitMQ connection:", error);
    }
  }

  getChannel(): Channel {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }
    return this.channel;
  }

  async setupDLQ() {
    const channel = this.getChannel();

    await channel.assertExchange("dlq.exchange", "fanout", { durable: true });
    await channel.assertQueue("dlq.queue", { durable: true });
    await channel.bindQueue("dlq.queue", "dlq.exchange", "");

    logger.info("Dead Letter Queue (DLQ) setup complete");
  }
}

export const rabbitMq = new RabbitMqConnection();
