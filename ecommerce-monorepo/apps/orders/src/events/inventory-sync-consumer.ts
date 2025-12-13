import {
  EventBusService,
  ProductEventType,
  StockChangedEvent,
  RedisService,
} from "@ecommerce/common";
import { env } from "../config/env";

const redis = new RedisService({
  url: env.REDIS_URL,
  maxRetries: 3,
  retryDelay: 50,
});
export class InventorySyncConsumer {
  constructor(private eventBus: EventBusService) {}

  async start() {
    await this.eventBus.subscribe<StockChangedEvent["data"]>(
      "order-service-inventory-sync",
      [ProductEventType.STOCK_CHANGED, ProductEventType.CREATED],
      async (event) => {
        const { id, stockQuantity } = event.data;
        await redis.set(`stock:${id}`, stockQuantity);
      }
    );
  }
}
