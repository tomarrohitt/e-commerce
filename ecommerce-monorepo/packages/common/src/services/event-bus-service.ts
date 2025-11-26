import amqp, { Channel, ChannelModel } from "amqplib";
import { Event, EventBusConfig } from "../types/event-types";

export class EventBusService {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private isConnected = false;

  private readonly config: Required<EventBusConfig>;

  private reconnectAttempts = 0;

  constructor(config: EventBusConfig = {}) {
    this.config = {
      serviceName: config.serviceName || "unknown-service",
      url: config.url || process.env.RABBITMQ_URL || "amqp://localhost",
      exchangeName: config.exchangeName || "ecommerce.events",
      dlqExchange: config.dlqExchange || "dlq.exchange",
      dlqQueue: config.dlqQueue || "dlq.queue",
      prefetchCount: config.prefetchCount || 10,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      reconnectDelay: config.reconnectDelay || 5000,
    };
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      this.connection = await amqp.connect(this.config.url);

      this.connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
        this.handleDisconnect();
      });

      this.connection.on("close", () => {
        console.warn("RabbitMQ connection closed");
        this.handleDisconnect();
      });

      this.channel = await this.connection.createChannel();

      await this.channel.prefetch(this.config.prefetchCount);

      await this.channel.assertExchange(this.config.exchangeName, "topic", {
        durable: true,
      });

      await this.setupDLQ();

      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log("Connected to Event Bus");
    } catch (error) {
      console.error("Event Bus connection failed:", error);
      this.handleDisconnect();
    }
  }

  private async setupDLQ() {
    if (!this.channel) return;

    await this.channel.assertExchange(this.config.dlqExchange, "fanout", {
      durable: true,
    });

    await this.channel.assertQueue(this.config.dlqQueue, {
      durable: true,
      arguments: {
        "x-message-ttl": 7 * 24 * 60 * 60 * 1000,
      },
    });

    await this.channel.bindQueue(
      this.config.dlqQueue,
      this.config.dlqExchange,
      ""
    );

    console.log("✅ Dead Letter Queue configured");
  }

  private handleDisconnect() {
    this.isConnected = false;

    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Reconnecting in ${this.config.reconnectDelay}ms... (Attempt ${this.reconnectAttempts})`
      );
      setTimeout(() => this.connect(), this.config.reconnectDelay);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  async publish<T>(routingKey: string, event: Event<T>): Promise<void> {
    if (!this.channel || !this.isConnected) {
      throw new Error("Event Bus not connected");
    }

    try {
      const content = Buffer.from(JSON.stringify(event));

      const published = this.channel.publish(
        this.config.exchangeName,
        routingKey,
        content,
        {
          persistent: true,
          timestamp: Date.now(),
          contentType: "application/json",
          messageId: event.eventId,
        }
      );

      if (!published) {
        console.warn(`RabbitMQ buffer full. Waiting for drain...`);
        await new Promise<void>((resolve) => {
          this.channel!.once("drain", resolve);
        });
      }

      console.log(`Published: ${routingKey} [${event.eventId}]`);
    } catch (error) {
      console.error(`Failed to publish ${routingKey}:`, error);
      throw error;
    }
  }

  async subscribe<T>(
    queueName: string,
    routingKeys: string[],
    handler: (event: Event<T>) => Promise<void>,
    options?: {
      maxRetries?: number;
      retryDelay?: number;
    }
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("Event Bus not connected");
    }

    const maxRetries = options?.maxRetries || 3;

    await this.channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": this.config.dlqExchange,
        ...(options?.retryDelay && {
          "x-message-ttl": options.retryDelay,
        }),
      },
    });

    for (const key of routingKeys) {
      await this.channel.bindQueue(queueName, this.config.exchangeName, key);
    }

    this.channel.consume(
      queueName,
      async (msg) => {
        if (!msg) return;

        try {
          const event = JSON.parse(msg.content.toString());

          await handler(event);
          this.channel!.ack(msg);
        } catch (error) {
          console.error(`Error processing ${queueName}:`, error);
          const retries = (msg.properties.headers?.["x-retry-count"] || 0) + 1;

          if (retries < maxRetries) {
            console.log(`🔄 Retrying (${retries}/${maxRetries})...`);
            this.channel!.publish(
              this.config.exchangeName,
              msg.fields.routingKey,
              msg.content,
              {
                ...msg.properties,
                headers: {
                  ...msg.properties.headers,
                  "x-retry-count": retries,
                },
              }
            );

            this.channel!.ack(msg);
          } else {
            console.error(`💀 Max retries reached. Sending to DLQ`);
            this.channel!.nack(msg, false, false);
          }
        }
      },
      {
        noAck: false,
      }
    );

    console.log(`Subscribed: ${queueName} -> [${routingKeys.join(", ")}]`);
  }

  getChannel(): Channel | null {
    return this.channel;
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.isConnected = false;
    console.log("Disconnected from Event Bus");
  }
}
