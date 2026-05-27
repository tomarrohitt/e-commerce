import { EventBusService } from "@ecommerce/common";
import { env } from "./env";

export const eventBus = new EventBusService({
  serviceName: "orders-service",
  url: env.RABBITMQ_URL,
});
