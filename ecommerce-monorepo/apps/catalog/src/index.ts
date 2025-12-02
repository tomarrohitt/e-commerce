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
import { EventStatus } from "@prisma/client";
import { env } from "./config/env";
import productAdminRouter from "./router/product-admin-router";
import categoryAdminRouter from "./router/category-admin-router";
import { OrderCreatedConsumer } from "./events/order-consumer";

const eventBus = new EventBusService({
  serviceName: "catalog-service",
  exchangeName: "ecommerce.events",
});

const outboxProcessor = new OutboxProcessor(
  prisma,
  eventBus,
  EventStatus,
  50,
  500,
);

const orderConsumer = new OrderCreatedConsumer(eventBus);

const app = express();
const PORT = env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(currentUser);

app.use("/api/products", productRouter);
app.use("/api/category", categoryRouter);

app.use("/api/admin/products", productAdminRouter);
app.use("/api/admin/category", categoryAdminRouter);

app.use(errorHandler);

async function startServer() {
  try {
    await eventBus.connect();
    app.listen(PORT, () => {
      console.log(`Catalog Service running on ${PORT}`);
      outboxProcessor.start();
      orderConsumer.start();
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
