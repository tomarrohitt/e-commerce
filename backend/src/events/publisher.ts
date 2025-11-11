// src/events/publisher.ts
import { Channel } from "amqplib";
import { rabbitMq } from "../config/rabbitmq";
import { logger } from "../utils/logger";
import { Address } from "../../generated/prisma/client";

export enum EventType {
  ORDER_CREATED = "order.created",
  ORDER_PAID = "order.paid",
  ORDER_CANCELLED = "order.cancelled",
  ORDER_SHIPPED = "order.shipped",
  ORDER_DELIVERED = "order.delivered",
  ORDER_REFUNDED = "order.refunded",
  USER_REGISTERED = "user.registered",
  PAYMENT_FAILED = "payment.failed",
}

export interface BaseEvent {
  eventId: string;
  eventType: EventType;
  timestamp: Date;
  userId?: string;
}

export interface OrderCreatedEvent extends BaseEvent {
  eventType: EventType.ORDER_CREATED;
  data: {
    userName: string;
    userEmail: string;
    orderId: string;
    shippingAddress: Address;
    totalAmount: number;
    items: {
      name: string;
      quantity: number;
      priceAtPurchase: number;
    }[];
  };
}

export interface OrderPaidEvent extends BaseEvent {
  eventType: EventType.ORDER_PAID;
  data: {
    orderId: string;
    userId: string;
  };
}

export interface OrderCancelledEvent extends BaseEvent {
  eventType: EventType.ORDER_CANCELLED;
  data: {
    userName: string;
    userEmail: string;
    orderId: string;
  };
}
export interface UserRegisteredEvent extends BaseEvent {
  eventType: EventType.USER_REGISTERED;
  data: {
    verificationLink: string;
    name: string;
    email: string;
  };
}

export type DomainEvent =
  | OrderCreatedEvent
  | OrderPaidEvent
  | OrderCancelledEvent
  | UserRegisteredEvent;

class EventPublisher {
  private exchange = "ecommerce.events";
  private channel: Channel | null = null;

  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    try {
      this.channel = rabbitMq.getChannel();
      await this.channel.assertExchange(this.exchange, "topic", {
        durable: true,
      });

      this.channel.on("drain", () => {
        logger.info("RabbitMQ channel drain event: publishing can resume.");
      });

      this.isInitialized = true;
    } catch (error) {
      logger.error("Failed to initialize event publisher:", error);
      throw error;
    }
  }

  async publish(event: DomainEvent): Promise<void> {
    try {
      if (!this.isInitialized || !this.channel) {
        logger.error(
          "Event publisher is not initialized. Call initialize() first."
        );
        throw new Error("Event publisher is not initialized.");
      }
      const message = Buffer.from(JSON.stringify(event));

      const canPublish = this.channel.publish(
        this.exchange,
        event.eventType,
        message,
        {
          persistent: true,
          contentType: "application/json",
          timestamp: Date.now(),
          messageId: event.eventId,
        }
      );

      if (canPublish) {
        logger.info(`Published event: ${event.eventType}`, {
          eventId: event.eventId,
        });
      } else {
        logger.warn(
          `RabbitMQ buffer full. Pausing publish for: ${event.eventType}`
        );
        await new Promise<void>((resolve) =>
          this.channel!.once("drain", () => {
            logger.info(
              `RabbitMQ buffer drained. Retrying publish for: ${event.eventType}`
            );
            this.publish(event)
              .then(resolve)
              .catch((err) => {
                logger.error(
                  `Retry publish failed for: ${event.eventType}`,
                  err
                );
                resolve();
              });
          })
        );
      }
    } catch (error) {
      logger.error(`Failed to publish event: ${event.eventType}`, { error });
      throw error;
    }
  }
}

export const eventPublisher = new EventPublisher();
