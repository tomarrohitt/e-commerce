import "dotenv/config";
import "express-async-errors";

import express from "express";
import {
  currentUser,
  errorHandler,
  EventBusService,
  OutboxProcessor,
} from "@ecommerce/common";
import { prisma } from "./config/prisma";
import productRouter from "./router/product-router";
import categoryRouter from "./router/category-router";

const eventBus = new EventBusService({
  serviceName: "catalog-service",
  exchangeName: "ecommerce.events",
});

const outboxProcessor = new OutboxProcessor(prisma, eventBus, 50, 500);

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(currentUser);

app.use("/api/products", productRouter);
app.use("/api/category", categoryRouter);

app.use(errorHandler);

async function startServer() {
  try {
    await eventBus.connect();
    app.listen(PORT, () => {
      console.log(`Catalog Service running on ${PORT}`);
      outboxProcessor.start();
    });
  } catch (error) {
    console.error("Failed to start server. Shutting down.", { error });
    process.exit(1);
  }
}

const shutdown = async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startServer();
