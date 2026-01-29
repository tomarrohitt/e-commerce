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
import { addressRouter } from "./router/address-router";
import { adminUserRouter } from "./router/user-admin-router";
import { env } from "./config/env";
import { adminAddressRouter } from "./router/address-admin-router";
import { logger } from "./config/logger";
import { ImageCleanUpConsumer } from "./worker/image-clean-up";

const eventBus = new EventBusService({
  serviceName: "identity-service",
  url: env.RABBITMQ_URL,
});

const outboxProcessor = new OutboxProcessor(prisma, eventBus, {
  batchSize: 50,
  pollInterval: 500,
});
const imageConsumer = new ImageCleanUpConsumer(eventBus);

const app = express();
app.use(express.json());

const PORT = env.PORT || 4001;

app.post("/api/auth/resend-verification-email", async (req, res) => {
  await auth.api.sendVerificationEmail({
    body: {
      email: req.body.email,
      callbackURL: "/verify-success",
    },
  });
  res.status(200).json({ message: "Verification email sent" });
});

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
      console.log(`Identity Service running on ${PORT}`);
      outboxProcessor.start();
      imageConsumer.start();
      console.log("Identity Service image worker is running");
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
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
