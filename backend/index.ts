import helmet from "helmet";
import compression from "compression";

import express from "express";
import cookieParser from "cookie-parser";

import { errorHandler } from "./src/middleware/error-middleware";
import { logger } from "./src/utils/logger";
import { prisma } from "./src/config/prisma";
import { config } from "./src/config";
import { toNodeHandler } from "better-auth/node";
import auth from "./src/config/auth";
import userRouter from "./src/router/user-router";
import productRouter from "./src/router/product-router";
import categoryRouter from "./src/router/category-router";
import addressRouter from "./src/router/address-router";
import adminAddressRouter from "./src/router/admin-address-router";
import cartRouter from "./src/router/cart-router";
import orderRouter from "./src/router/order-router";
import orderController from "./src/controller/order-controller";
import { rabbitMq } from "./src/config/rabbitmq";
import { eventPublisher } from "./src/events/publisher";

const app = express();
const PORT = config.port || 4000;
const trustedOrigins = ["http://localhost:3000", "http://localhost:4000"];

app.use((req, res, next) => {
  const origin = req.headers.origin!;
  if (trustedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,PATCH,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-CSRF-Token"
  );

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(helmet());
app.use(compression());

app.all("/api/auth/*splat", toNodeHandler(auth));

app.post(
  "/api/webhook/stripe",
  express.raw({ type: "application/json" }),
  orderController.handleStripeWebhook
);
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api/address", addressRouter);
app.use("/api/admin/address", adminAddressRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);

app.use(errorHandler);

async function startServer() {
  try {
    await rabbitMq.connect();
    await eventPublisher.initialize();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server. Shutting down.", { error });
    process.exit(1);
  }
}

const shutdown = async () => {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startServer();
