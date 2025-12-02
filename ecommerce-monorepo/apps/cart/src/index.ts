import "express-async-errors";
import express from "express";
import {
  EventBusService,
  errorHandler,
  currentUser,
  LoggerFactory,
} from "@ecommerce/common";
import { ProductConsumer } from "./events/product-consumer";
import cartRouter from "./router/cart-router";
import { env } from "./config/env";
import { OrderCreatedConsumer } from "./events/order-consumer";

const logger = LoggerFactory.create("CartService");

const app = express();
const PORT = env.PORT || 4003;

const SERVICE_MODE = env.SERVICE_MODE || "ALL";

const eventBus = new EventBusService({
  serviceName: "cart-service",
  url: env.RABBITMQ_URL,
});

const productConsumer = new ProductConsumer(eventBus);
const orderCreatedConsumer = new OrderCreatedConsumer(eventBus);

async function start() {
  try {
    await eventBus.connect();

    if (SERVICE_MODE === "WORKER" || SERVICE_MODE === "ALL") {
      console.log("👷 Cart Worker: Starting Event Consumer...");
      await productConsumer.start();
      await orderCreatedConsumer.start();
    }

    if (SERVICE_MODE === "API" || SERVICE_MODE === "ALL") {
      app.use(currentUser);
      app.use(express.json());
      app.use("/api/cart", cartRouter);
      app.use(errorHandler);

      app.listen(PORT, () => {
        console.log(`🛒 Cart API running on port ${PORT}`);
      });
    }
  } catch (err) {
    logger.error("Failed to start Cart Service", err);
    process.exit(1);
  }
}

start();
