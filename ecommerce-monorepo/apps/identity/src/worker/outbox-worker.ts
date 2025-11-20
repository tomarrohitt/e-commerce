import { prisma } from "../config/prisma";
import { eventBus } from "@ecommerce/common";

const BATCH_SIZE = 50;
const POLLING_INTERVAL = 2000; // 2 seconds

async function processOutboxEvents() {
  const events = await prisma.outboxEvent.findMany({
    where: { status: "PENDING" },
    take: BATCH_SIZE,
    orderBy: { createdAt: "asc" },
  });

  if (events.length === 0) return;

  console.log(`Processing ${events.length} outbox events...`);

  for (const event of events) {
    try {
      await eventBus.publish(event.eventType, {
        eventId: event.id,
        eventType: event.eventType,
        timestamp: event.createdAt.toISOString(),
        data: event.payload,
      });

      // 3. Mark as PUBLISHED
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: "PUBLISHED" },
      });

      console.log(`Event ${event.id} published`);
    } catch (error) {
      console.error(`Failed to publish event ${event.id}:`, error);

      // Optional: Mark as FAILED or leave as PENDING to retry
      // Ideally, increment a 'retries' counter in the DB
    }
  }
}

// Start the Worker
async function startWorker() {
  console.log("Outbox Worker Started");

  // Ensure Event Bus is connected
  await eventBus.connect();

  // Polling Loop
  setInterval(() => {
    processOutboxEvents().catch((err) => {
      console.error("Worker Error:", err);
    });
  }, POLLING_INTERVAL);
}

// Only run if this file is executed directly (not imported)
if (require.main === module) {
  startWorker();
}
