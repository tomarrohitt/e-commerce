import express from "express";
import { EmailConsumer } from "./events/email-consumer";
import { errorHandler } from "@ecommerce/common";
import { env } from "./config/env";
import { eventBus } from "./config/event-bus";
import { healthCheck } from "./controller/health-controller";

const app = express();
const PORT = env.PORT;

app.use(errorHandler);

const emailConsumer = new EmailConsumer(eventBus);

async function start() {
  try {
    await eventBus.connect();
    await emailConsumer.start();

    app.get("/api/email/health", healthCheck);
    app.listen(PORT, () => {
      console.log(`Email Service running on ${PORT}`);
    });
  } catch (error) {
    console.error("Email Service failed to start:", error);
    process.exit(1);
  }
}

start();
