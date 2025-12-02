import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import auth from "./config/auth";
import userRouter from "./router/user-router";
import {
  errorHandler,
  currentUser,
  OutboxProcessor,
  EventBusService,
} from "@ecommerce/common";
import { prisma } from "./config/prisma";
import internalRouter from "./router/internal-router";
import { EventStatus } from "@prisma/client";
import { addressRouter } from "./router/address-router";
import { adminUserRouter } from "./router/user-admin-router";
import { env } from "./config/env";
import { adminAddressRouter } from "./router/address-admin-router";

const eventBus = new EventBusService({
  serviceName: "identity-service",
  exchangeName: "ecommerce.events",
});

const outboxProcessor = new OutboxProcessor(
  prisma,
  eventBus,
  EventStatus,
  50,
  500,
);
const app = express();
const PORT = env.PORT || 4001;

app.all("/api/auth/*", toNodeHandler(auth));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(currentUser);

app.use("/api/internal", internalRouter);
app.use("/api/user", userRouter);
app.use("/api/addresses", addressRouter);
app.use("/api/admin/user", adminUserRouter);
app.use("/api/admin/addresses", adminAddressRouter);

app.use(errorHandler);

async function startServer() {
  try {
    await eventBus.connect();
    app.listen(PORT, () => {
      console.log(`Catalog Service running on ${PORT}`);
      outboxProcessor.start();
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
