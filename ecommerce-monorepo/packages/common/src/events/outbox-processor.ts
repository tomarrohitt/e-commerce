import { IEventBusService } from "../services/event-bus-service";
import { Event } from "../types/event-types";
import {
  IOutboxProcessor,
  OutboxEventStatus,
  OutboxPrismaClient,
  OutboxProcessorConfig,
  OutboxRecord,
} from "../types/outbox-types";
import { OUTBOX_DEFAULTS } from "../constants";
import { ILogger, LoggerFactory } from "../services/logger-service";

export class OutboxProcessor implements IOutboxProcessor {
  private running = false;
  private processingLoop: Promise<void> | null = null;
  private readonly logger: ILogger;

  private readonly config: Required<OutboxProcessorConfig>;

  constructor(
    private readonly prisma: OutboxPrismaClient,
    private readonly eventBus: IEventBusService,
    config: OutboxProcessorConfig = {},
  ) {
    this.config = {
      batchSize: config.batchSize ?? OUTBOX_DEFAULTS.BATCH_SIZE,
      pollInterval: config.pollInterval ?? OUTBOX_DEFAULTS.POLL_INTERVAL,
      lockTimeout: config.lockTimeout ?? OUTBOX_DEFAULTS.LOCK_TIMEOUT,
      maxRetries: config.maxRetries ?? 3,
    };

    this.logger = LoggerFactory.create("OutboxProcessor");
  }

  async start(): Promise<void> {
    if (this.running) {
      this.logger.warn("Outbox processor already running");
      return;
    }

    this.running = true;

    this.processingLoop = this.loop();
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.logger.info("Stopping outbox processor");
    this.running = false;

    if (this.processingLoop) {
      await this.processingLoop;
    }

    this.logger.info("Outbox processor stopped");
  }

  isRunning(): boolean {
    return this.running;
  }

  private async loop(): Promise<void> {
    while (this.running) {
      try {
        await this.processBatch();
      } catch (error) {
        this.logger.error("Error in processing loop", error);
      }

      await this.sleep(this.config.pollInterval);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async processBatch(): Promise<void> {
    try {
      const events = await this.prisma.outboxEvent.findMany({
        where: { status: OutboxEventStatus.PENDING },
        take: this.config.batchSize,
        orderBy: { createdAt: "asc" },
      });

      if (events.length === 0) {
        return;
      }

      const lockedEvents = await this.lockEvents(events);

      if (lockedEvents.length === 0) {
        this.logger.debug("No events could be locked");
        return;
      }

      await Promise.allSettled(
        lockedEvents.map((event) => this.processEvent(event)),
      );
    } catch (error) {
      this.logger.error("Outbox batch processing error", error);
    }
  }
  private async lockEvents(events: OutboxRecord[]): Promise<OutboxRecord[]> {
    const locked: OutboxRecord[] = [];

    for (const event of events) {
      try {
        const updated = await this.prisma.outboxEvent.update({
          where: {
            id: event.id,
            status: OutboxEventStatus.PENDING,
          },
          data: {
            status: OutboxEventStatus.PROCESSING,
          },
        });

        locked.push(updated);
      } catch (error) {
        this.logger.debug("Event already locked", { eventId: event.id });
      }
    }

    return locked;
  }

  private async processEvent(event: OutboxRecord): Promise<void> {
    try {
      const eventPayload: Event = {
        eventId: event.id,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        timestamp: this.formatTimestamp(event.createdAt),
        data: event.payload,
      };

      await this.eventBus.publish(event.eventType, eventPayload);

      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: OutboxEventStatus.PROCESSED },
      });
    } catch (error) {
      this.logger.error("Failed to process event", error, {
        eventId: event.id,
        eventType: event.eventType,
      });

      await this.markEventAsFailed(event.id);
    }
  }

  private async markEventAsFailed(eventId: string): Promise<void> {
    try {
      await this.prisma.outboxEvent.update({
        where: { id: eventId },
        data: { status: OutboxEventStatus.FAILED },
      });
    } catch (error) {
      this.logger.error("Failed to mark event as failed", error, { eventId });
    }
  }

  private formatTimestamp(date: Date | string): string {
    return date instanceof Date
      ? date.toISOString()
      : new Date(date).toISOString();
  }
}
