import express from "express";
import { EmailConsumer } from "./events/email-consumer";
import { EventBusService, LoggerFactory } from "@ecommerce/common";
import { env } from "./config/env";

const app = express();
const PORT = env.PORT;

const logger = LoggerFactory.create("EmailService");

const eventBus = new EventBusService({
  serviceName: "email-service",
  url: env.RABBITMQ_URL,
});

const emailConsumer = new EmailConsumer(eventBus);

async function start() {
  try {
    await eventBus.connect();
    await emailConsumer.start();

    app.get("/health", (req, res) => res.json({ status: "OK" }));

    app.listen(PORT, () => {
      console.log(`📧 Email Service running on ${PORT}`);
    });
  } catch (error) {
    logger.error("Email Service failed to start:", error);
    process.exit(1);
  }
}

start();
