import "dotenv/config";
import Redis from "ioredis";
import { logger } from "../utils/logger";

const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true,
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (error) => {
  logger.error("Redis connection error:", error);
});

redis.connect().catch((error) => {
  logger.error("Failed to connect to Redis:", error);
});

export default redis;
