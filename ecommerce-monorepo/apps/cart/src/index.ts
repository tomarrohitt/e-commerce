import "dotenv/config";
import "express-async-errors";
import express from "express";
import { EventBusService, errorHandler, currentUser } from "@ecommerce/common";
import { ProductConsumer } from "./events/product-consumer";
import cartRouter from "./router/cart-router";

const app = express();
const PORT = process.env.PORT || 4003;

const SERVICE_MODE = process.env.SERVICE_MODE || "ALL";

const eventBus = new EventBusService({
  serviceName: "cart-service",
  exchangeName: "ecommerce.events",
});

const productConsumer = new ProductConsumer(eventBus);

async function start() {
  try {
    await eventBus.connect();

    if (SERVICE_MODE === "WORKER" || SERVICE_MODE === "ALL") {
      console.log("👷 Cart Worker: Starting Event Consumer...");
      await productConsumer.start();
    }

    if (SERVICE_MODE === "API" || SERVICE_MODE === "ALL") {
      app.use(express.json());
      app.use(currentUser);
      app.use("/api/cart", currentUser, cartRouter);
      app.use(errorHandler);

      app.listen(PORT, () => {
        console.log(`🛒 Cart API running on port ${PORT}`);
      });
    }
  } catch (err) {
    console.error("Failed to start Cart Service", err);
    process.exit(1);
  }
}

start();
