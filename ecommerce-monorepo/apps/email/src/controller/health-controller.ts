import { Request, Response } from "express";
import { eventBus } from "../config/event-bus";

const TIMEOUT_MS = 3000;

const check = (promise: Promise<any>) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject("Timeout"), TIMEOUT_MS)),
  ]);

export const healthCheck = async (_req: Request, res: Response) => {
  const dependencies = {
    rabbitmq: () =>
      eventBus.isConnected()
        ? Promise.resolve()
        : Promise.reject("Disconnected"),
  };

  const details: Record<string, string> = {
    timestamp: new Date().toISOString(),
  };
  let isHealthy = true;
  await Promise.all(
    Object.entries(dependencies).map(async ([name, runCheck]) => {
      try {
        await check(runCheck());
        details[name] = "healthy";
      } catch (err) {
        console.error(`Health check failed for ${name}:`, err);
        details[name] = "unhealthy";
        isHealthy = false;
      }
    }),
  );

  const status = isHealthy ? 200 : 503;

  return res.status(status).json({
    status: isHealthy ? true : false,
    message: isHealthy ? "System operational" : "Service Unavailable",
    details,
  });
};
