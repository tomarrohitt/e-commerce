import { EventBusService } from "../services/event-bus-service";
import { Event } from "../types/event-types";
import { OutboxPrismaClient } from "../types/outbox-types";

export class OutboxProcessor {
  private isRunning = false;

  constructor(
    private prisma: OutboxPrismaClient,
    private eventBus: EventBusService,
    private EventStatus: { PENDING: string; PROCESSED: string; FAILED: string },
    private batchSize = 50,
    private pollInterval = 500
  ) {}

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("Outbox Processor Started");
    this.loop();
  }

  private async loop() {
    while (this.isRunning) {
      await this.processBatch();
      await new Promise((r) => setTimeout(r, this.pollInterval));
    }
  }

  private async processBatch() {
    try {
      const events = await this.prisma.outboxEvent.findMany({
        where: { status: this.EventStatus.PENDING },
        take: this.batchSize,
        orderBy: { createdAt: "asc" },
      });

      if (events.length === 0) return;

      await Promise.all(
        events.map(async (dbEvent) => {
          try {
            const eventPayload: Event = {
              eventId: dbEvent.id,
              eventType: dbEvent.eventType,
              aggregateId: dbEvent.aggregateId,
              timestamp:
                dbEvent.createdAt instanceof Date
                  ? dbEvent.createdAt.toISOString()
                  : new Date().toISOString(),
              data: dbEvent.payload,
            };

            await this.eventBus.publish(dbEvent.eventType, eventPayload);
            await this.prisma.outboxEvent.update({
              where: { id: dbEvent.id },
              data: { status: this.EventStatus.PROCESSED },
            });
          } catch (err) {
            console.error(`Failed to publish event ${dbEvent.id}`, err);
          }
        })
      );
    } catch (error) {
      console.error("Outbox Processor Error:", error);
    }
  }
}
