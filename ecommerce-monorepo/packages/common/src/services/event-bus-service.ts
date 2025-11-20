import amqp, { Channel, ChannelModel, Connection } from "amqplib";

export interface Event<T = any> {
  eventId: string;
  eventType: string;
  timestamp: string;
  data: T;
}
export class EventBusService {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private isConnected = false;

  // Configuration
  private readonly exchangeName = "ecommerce.events";
  private readonly dlqExchange = "dlq.exchange";
  private readonly dlqQueue = "dlq.queue";

  // Reconnection Logic (From rabbitmq.ts)
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly reconnectDelay = 5000;

  async connect(url?: string): Promise<void> {
    if (this.isConnected) return;

    try {
      const rabbitUrl = url || process.env.RABBITMQ_URL || "amqp://localhost";
      this.connection = await amqp.connect(rabbitUrl);

      // Attach Error Listeners (From rabbitmq.ts)
      this.connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
        this.handleDisconnect();
      });

      this.connection.on("close", () => {
        console.warn("RabbitMQ connection closed");
        this.handleDisconnect();
      });

      this.channel = await this.connection.createChannel();

      // 1. Setup Exchanges
      await this.channel.assertExchange(this.exchangeName, "topic", {
        durable: true,
      });

      // 2. Setup Dead Letter Queue (Integrated from rabbitmq.ts)
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

    // Create the DLQ Exchange and Queue
    await this.channel.assertExchange(this.dlqExchange, "fanout", {
      durable: true,
    });
    await this.channel.assertQueue(this.dlqQueue, { durable: true });
    await this.channel.bindQueue(this.dlqQueue, this.dlqExchange, "");

    console.log("✅ Dead Letter Queue (DLQ) Configured");
  }

  private handleDisconnect() {
    this.isConnected = false;
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Reconnecting in ${this.reconnectDelay}ms... (Attempt ${this.reconnectAttempts})`
      );
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error(
        "Max reconnection attempts reached. Service may be unstable."
      );
      // In microservices, we usually don't process.exit(1) because the HTTP server might still be useful
      // but we should definitely log a critical alert here.
    }
  }

  // Publish with Backpressure (From publisher.ts)
  async publish<T>(routingKey: string, event: Event<T>): Promise<void> {
    if (!this.channel || !this.isConnected) {
      throw new Error("Event Bus not connected");
    }

    try {
      const content = Buffer.from(JSON.stringify(event));

      const canPublish = this.channel.publish(
        this.exchangeName,
        routingKey,
        content,
        { persistent: true, timestamp: Date.now() }
      );

      if (!canPublish) {
        console.warn(`RabbitMQ buffer full. Pausing publish: ${routingKey}`);
        await new Promise<void>((resolve) => {
          this.channel!.once("drain", resolve);
        });
      }

      console.log(`Published: ${routingKey}`);
    } catch (error) {
      console.error(`Failed to publish ${routingKey}:`, error);
      throw error;
    }
  }

  // Subscribe with DLQ Linking (Improved Logic)
  async subscribe<T>(
    queueName: string,
    routingKeys: string[],
    handler: (event: Event<T>) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("Event Bus not connected");
    }

    // Create Queue with DLQ Mapping
    await this.channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        // CRITICAL: If message is rejected (nack), send it to DLQ Exchange
        "x-dead-letter-exchange": this.dlqExchange,
      },
    });

    for (const key of routingKeys) {
      await this.channel.bindQueue(queueName, this.exchangeName, key);
    }

    this.channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          await handler(event);
          this.channel!.ack(msg);
        } catch (error) {
          console.error(`Error in ${queueName}:`, error);

          // NACK with requeue = false
          // Because of 'x-dead-letter-exchange', this moves the msg to 'dlq.queue'
          // It does NOT delete it, and it does NOT loop infinitely.
          this.channel!.nack(msg, false, false);
        }
      }
    });

    console.log(`Subscribed ${queueName} to [${routingKeys.join(", ")}]`);
  }
}

export const eventBus = new EventBusService();
