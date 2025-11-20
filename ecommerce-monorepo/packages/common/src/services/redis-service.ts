import Redis, { Redis as RedisClient } from "ioredis";

export interface SessionCache {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}

class RedisService {
  private client: RedisClient;
  private isConnected = false;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL!, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on("connect", () => {
      this.isConnected = true;
      console.log("Redis connected");
    });

    this.client.on("error", (error) => {
      this.isConnected = false;
      console.error("Redis connection error:", error);
    });

    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error("Failed to initial connect to Redis:", error);
    }
  }

  async getSession(sessionId: string): Promise<SessionCache | null> {
    const data = await this.client.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async setSession(
    sessionId: string,
    session: SessionCache,
    ttl: number = 3600
  ): Promise<void> {
    await this.client.setex(
      `session:${sessionId}`,
      ttl,
      JSON.stringify(session)
    );
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.client.del(`session:${sessionId}`);
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);

    if (ttl) {
      await this.client.setex(key, ttl, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
  getClient(): RedisClient {
    return this.client;
  }
}

export const redisService = new RedisService();
