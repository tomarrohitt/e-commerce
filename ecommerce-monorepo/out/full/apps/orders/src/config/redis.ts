import { RedisService } from "@ecommerce/common";
import { env } from "./env";

export const redis = new RedisService({
  url: env.REDIS_URL,
  maxRetries: 3,
  retryDelay: 50,
});
