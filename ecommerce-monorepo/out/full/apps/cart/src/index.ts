import "express-async-errors";
import express from "express";
import {
  EventBusService,
  errorHandler,
  currentUser,
  sendSuccess,
} from "@ecommerce/common";
import { ProductConsumer } from "./events/product-consumer";
import cartRouter from "./router/cart-router";
import { env } from "./config/env";
import { OrderCreatedConsumer } from "./events/order-consumer";
import { eventBus } from "./config/event-bus";
import { healthCheck } from "./controller/health-controller";

const app = express();
const PORT = env.PORT || 4003;

const SERVICE_MODE = env.SERVICE_MODE || "ALL";

const productConsumer = new ProductConsumer(eventBus);
const orderCreatedConsumer = new OrderCreatedConsumer(eventBus);

app.use(errorHandler);

app.get("/api/cart/health", healthCheck);

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
        console.log(`Cart API running on port ${PORT}`);
      });
    }
  } catch (err) {
    console.error("Failed to start Cart Service", err);
    process.exit(1);
  }
}

start();
