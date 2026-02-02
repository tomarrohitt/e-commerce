import "dotenv/config";
import "express-async-errors";
import express from "express";
import { currentUser, errorHandler, OutboxProcessor } from "@ecommerce/common";
import { prisma } from "./config/prisma";
import { env } from "./config/env";

import productRouter from "./router/product-router";
import categoryRouter from "./router/category-router";
import reviewRouter from "./router/review-router";

import { OrderCreatedConsumer } from "./events/order-created-consumer";
import { OrderCancelledConsumer } from "./events/order-cancelled-consumer";
import { OrderDeliveredConsumer } from "./events/order-delivered-consumer";
import { UserCreatedConsumer } from "./events/user-created-consumer";
import { eventBus } from "./config/event-bus";
import { healthCheck } from "./controllers/health-controller";

const outboxProcessor = new OutboxProcessor(prisma, eventBus, {
  batchSize: 50,
  pollInterval: 500,
});

const orderCreatedConsumer = new OrderCreatedConsumer(eventBus);
const orderCancelledConsumer = new OrderCancelledConsumer(eventBus);
const orderDeliveredConsumer = new OrderDeliveredConsumer(eventBus);
const userCreatedConsumer = new UserCreatedConsumer(eventBus);

const app = express();
const PORT = env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/catalog/health", healthCheck);

app.use(currentUser);

app.use("/api/products", productRouter);
app.use("/api/category", categoryRouter);

app.use("/api/reviews", reviewRouter);

app.use(errorHandler);

async function startServer() {
  try {
    await eventBus.connect();
    await orderCreatedConsumer.start();
    await orderCancelledConsumer.start();
    await orderDeliveredConsumer.start();
    await userCreatedConsumer.start();
    outboxProcessor.start();

    app.listen(PORT, () => {
      console.log(`Catalog Service running on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
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
