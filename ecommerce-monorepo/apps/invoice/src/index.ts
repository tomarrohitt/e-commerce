import express from "express";
import { errorHandler, OutboxProcessor } from "@ecommerce/common";
import { env } from "./config/env";
import { InvoiceConsumer } from "./events/invoice-consumer";
import { prisma } from "./config/prisma";
import invoiceRouter from "./router/invoice-router";
import { eventBus } from "./config/event-bus";
import { healthCheck } from "./controller/health-controller";

const outboxProcessor = new OutboxProcessor(prisma, eventBus, {
  batchSize: 50,
  pollInterval: 500,
});

const invoiceConsumer = new InvoiceConsumer(eventBus);
const app = express();
const PORT = env.PORT || 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/invoice/download", invoiceRouter);

app.get("/api/invoice/health", healthCheck);

app.use(errorHandler);

async function start() {
  try {
    await eventBus.connect();
    await invoiceConsumer.start();

    const server = app.listen(PORT, () => {
      outboxProcessor.start();
      console.log(`Invoice Service running on port ${PORT}`);
    });

    const shutdown = async () => {
      console.info("Starting graceful shutdown...");
      server.close();

      outboxProcessor.stop();
      await prisma.$disconnect();
      await eventBus.disconnect();

      console.info("Shutdown complete.");
      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Invoice Service failed to start:", error);
    process.exit(1);
  }
}

start();
