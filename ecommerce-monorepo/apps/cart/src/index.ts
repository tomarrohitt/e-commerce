import "dotenv/config";
import "express-async-errors";

import express from "express";

import { currentUser, errorHandler, EventBusService } from "@ecommerce/common";
import cartRouter from "./router/cart-router";
import { prisma } from "./config/prisma";
import { ProductConsumer } from "./events/product-consumer";

const eventBus = new EventBusService({
  serviceName: "cart-service",
  exchangeName: "ecommerce.events",
});

const productConsumer = new ProductConsumer(eventBus);

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(currentUser);

app.use("/api/cart", cartRouter);

app.use(errorHandler);

async function startServer() {
  try {
    await eventBus.connect();
    await productConsumer.start();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
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
