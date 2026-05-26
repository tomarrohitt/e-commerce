import amqp, { Channel, ChannelModel } from "amqplib";
import { Event, EventBusConfig } from "../types/event-types";
import { EVENT_BUS_DEFAULTS } from "../constants";
import { ILogger, LoggerFactory } from "./logger-service";

export interface IEventBusService {
  connect(): Promise<void>;
  publish<T>(routingKey: string, event: Event<T>): Promise<void>;
  subscribe<T>(
    queueName: string,
    routingKeys: string[],
    handler: (event: Event<T>) => Promise<void>,
    options?: SubscribeOptions,
  ): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

export interface SubscribeOptions {
  maxRetries?: number;
  retryDelay?: number;
  deadLetterExchange?: string;
}

export class EventBusService implements IEventBusService {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private connected = false;
  private reconnectAttempts = 0;

  private reconnecting = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private readonly config: Required<EventBusConfig>;
  private readonly logger: ILogger;

  constructor(config: EventBusConfig = {}) {
    this.config = {
      serviceName: config.serviceName || "unknown-service",
      url: config.url || EVENT_BUS_DEFAULTS.EXCHANGE_NAME,
      exchangeName: config.exchangeName || EVENT_BUS_DEFAULTS.EXCHANGE_NAME,
      dlqExchange: config.dlqExchange || EVENT_BUS_DEFAULTS.DLQ_EXCHANGE,
      dlqQueue: config.dlqQueue || EVENT_BUS_DEFAULTS.DLQ_QUEUE,
      prefetchCount: config.prefetchCount ?? EVENT_BUS_DEFAULTS.PREFETCH_COUNT,
      maxReconnectAttempts:
        config.maxReconnectAttempts ??
        EVENT_BUS_DEFAULTS.MAX_RECONNECT_ATTEMPTS,
      reconnectDelay:
        config.reconnectDelay ?? EVENT_BUS_DEFAULTS.RECONNECT_DELAY,
    };

    this.logger = LoggerFactory.create(`EventBus:${this.config.serviceName}`);
  }

  async connect(): Promise<void> {
    if (this.connected) {
      this.logger.debug("Already connected");
      return;
    }

    try {
      this.connection = await amqp.connect(this.config.url);

      this.setupConnectionHandlers();

      this.channel = await this.connection.createChannel();
      await this.channel.prefetch(this.config.prefetchCount);

      await this.setupExchanges();
      await this.setupDLQ();

      this.connected = true;
      this.reconnectAttempts = 0;
      this.reconnecting = false;
    } catch (error) {
      this.logger.error("Event Bus connection failed", error);
      this.handleDisconnect();
      throw error;
    }
  }

  private setupConnectionHandlers(): void {
    if (!this.connection) return;

    this.connection.on("error", (err) => {
      this.logger.error("Connection error", err);
      this.handleDisconnect();
    });

    this.connection.on("close", () => {
      this.logger.warn("Connection closed");
      this.handleDisconnect();
    });
  }

  private async setupExchanges(): Promise<void> {
    if (!this.channel) return;

    await this.channel.assertExchange(this.config.exchangeName, "topic", {
      durable: true,
    });
  }

  private async setupDLQ(): Promise<void> {
    if (!this.channel) return;

    await this.channel.assertExchange(this.config.dlqExchange, "fanout", {
      durable: true,
    });

    await this.channel.assertQueue(this.config.dlqQueue, {
      durable: true,
      arguments: {
        "x-message-ttl": EVENT_BUS_DEFAULTS.DLQ_TTL,
      },
    });

    await this.channel.bindQueue(
      this.config.dlqQueue,
      this.config.dlqExchange,
      "",
    );
  }

  private handleDisconnect(): void {
    this.connected = false;

    if (this.reconnecting) {
      this.logger.debug("Reconnection already in progress");
      return;
    }

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.logger.error("Max reconnection attempts reached", {
        attempts: this.reconnectAttempts,
        max: this.config.maxReconnectAttempts,
      });
      return;
    }

    this.reconnecting = true;
    this.reconnectAttempts++;

    const delay = this.config.reconnectDelay * this.reconnectAttempts;

    this.logger.info("Scheduling reconnection", {
      attempt: this.reconnectAttempts,
      delay,
    });

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        this.logger.error("Reconnection attempt failed", error);
        this.reconnecting = false;
      }
    }, delay);
  }

  async publish<T>(routingKey: string, event: Event<T>): Promise<void> {
    if (!this.channel || !this.connected) {
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
        },
      );

      if (!published) {
        this.logger.warn("RabbitMQ buffer full, waiting for drain");
        await new Promise<void>((resolve) => {
          this.channel!.once("drain", resolve);
        });
      }
    } catch (error) {
      this.logger.error("Failed to publish event", error, {
        routingKey,
        eventId: event.eventId,
      });
      throw error;
    }
  }

  async subscribe<T>(
    queueName: string,
    routingKeys: string[],
    handler: (event: Event<T>) => Promise<void>,
    options: SubscribeOptions = {},
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("Event Bus not connected");
    }

    const maxRetries = options.maxRetries ?? EVENT_BUS_DEFAULTS.MAX_RETRIES;
    const dlxExchange = options.deadLetterExchange ?? this.config.dlqExchange;

    await this.channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": dlxExchange,
        ...(options.retryDelay && {
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
          const event = JSON.parse(msg.content.toString()) as Event<T>;

          await handler(event);
          this.channel!.ack(msg);
        } catch (error) {
          this.logger.error("Error processing event", error, {
            queue: queueName,
          });

          const retries = (msg.properties.headers?.["x-retry-count"] || 0) + 1;

          if (retries < maxRetries) {
            this.logger.info("Retrying event", {
              retry: retries,
              maxRetries,
            });

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
              },
            );

            this.channel!.ack(msg);
          } else {
            this.logger.error("Max retries reached, sending to DLQ", {
              queue: queueName,
            });
            this.channel!.nack(msg, false, false);
          }
        }
      },
      {
        noAck: false,
      },
    );
  }

  isConnected(): boolean {
    return this.connected;
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }

    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }

    this.connected = false;
    this.reconnecting = false;
    this.logger.info("Disconnected from Event Bus");
  }

  getChannel(): Channel | null {
    return this.channel;
  }
}
