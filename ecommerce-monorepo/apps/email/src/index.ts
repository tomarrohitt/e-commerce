import express from "express";
import { EmailConsumer } from "./events/email-consumer";
import { EventBusService } from "@ecommerce/common";
import { env } from "./config/env";

const app = express();
const PORT = env.PORT;

const eventBus = new EventBusService({
  serviceName: "email-service",
  exchangeName: "ecommerce.events",
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
    console.error("Email Service failed to start:", error);
    process.exit(1);
  }
}

start();
