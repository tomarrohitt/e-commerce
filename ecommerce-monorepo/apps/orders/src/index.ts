import "dotenv/config";
import "express-async-errors";

import express from "express";
import {
  currentUser,
  errorHandler,
  EventBusService,
  OutboxProcessor,
  sendSuccess,
} from "@ecommerce/common";
import { prisma } from "./config/prisma";
import { env } from "./config/env";
import orderRouter from "./router/order-router";
import adminRouter from "./router/admin-router";
import { StockConsumer } from "./events/stock-consumer";
import { orderController } from "./controller/order-controller";
import { OrderCreatedListener } from "./events/order-created-listener";
import { PaymentConsumer } from "./events/payment-consumer";
import { InventorySyncConsumer } from "./events/inventory-sync-consumer";
import { InvoiceGeneratedConsumer } from "./events/invoice-generated-consumer";
import { checkStaleOrders } from "./workers/order-timeout";
import { healthCheck } from "./controller/health-controller";
import { eventBus } from "./config/event-bus";

const outboxProcessor = new OutboxProcessor(prisma, eventBus, {
  batchSize: 50,
  pollInterval: 500,
});

const stockConsumer = new StockConsumer(eventBus);
const paymentConsumer = new PaymentConsumer(eventBus);
const paymentListener = new OrderCreatedListener(eventBus);
const inventorySync = new InventorySyncConsumer(eventBus);
const invoiceGeneratedConsumer = new InvoiceGeneratedConsumer(eventBus);

const app = express();
const PORT = env.PORT;

app.post(
  "/api/orders/webhook",
  express.raw({ type: "application/json" }),
  orderController.handleStripeWebhook,
);

app.get("/api/orders/health", healthCheck);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(currentUser);

app.use("/api/orders", orderRouter);
app.use("/api/admin/orders", adminRouter);

app.use(errorHandler);

async function startServer() {
  try {
    await eventBus.connect();
    await stockConsumer.start();
    await paymentListener.start();
    await paymentConsumer.start();
    await inventorySync.start();
    await invoiceGeneratedConsumer.start();
    setInterval(async () => await checkStaleOrders(), 60 * 1000);
    app.listen(PORT, () => {
      console.log(`Order Service running on ${PORT}`);
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
