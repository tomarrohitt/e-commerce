import Redis, { Redis as RedisClient } from "ioredis";
import { UserContext } from "../types/user-types";
import { env } from "../config/env";

export class RedisService {
  private client: RedisClient;
  private isConnected = false;

  // LUA SCRIPT: "Pointer Resolution"
  // This runs inside Redis. It is atomic and requires only 1 network hop.
  private getSessionScript = `
    local tokenKey = KEYS[1]

    -- 1. Get the Pointer (Layer 1)
    local pointerRaw = redis.call("GET", tokenKey)
    if not pointerRaw then return nil end

    -- 2. Decode JSON to get Session ID (using Redis cjson library)
    local pointer = cjson.decode(pointerRaw)
    local sessionId = pointer.sessionId

    -- 3. Get the Actual Data (Layer 2)
    -- We assume the session data key is format "session:{id}"
    local session = redis.call("GET", "session:" .. sessionId)
    return session
  `;

  constructor() {
    this.client = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on("connect", () => {
      this.isConnected = true;
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

  async getSessionByToken(token: string): Promise<UserContext | null> {
    try {
      const result = await this.client.eval(
        this.getSessionScript,
        1,
        `token:${token}`,
      );

      return result ? JSON.parse(result as string) : null;
    } catch (error) {
      console.error("Redis Lua Script Error:", error);
      return null;
    }
  }

  async saveSessionDualLayer(
    token: string,
    session: UserContext,
    ttl: number = 7 * 24 * 60 * 60,
  ): Promise<void> {
    const sessionId = session.sessionId;
    const pipeline = this.client.pipeline();
    pipeline.set(`token:${token}`, JSON.stringify({ sessionId }), "EX", ttl);

    pipeline.set(`session:${sessionId}`, JSON.stringify(session), "EX", ttl);

    await pipeline.exec();
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
      await this.client.set(key, stringValue, "EX", ttl);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  async updateSessionData(
    sessionId: string,
    session: UserContext,
    ttl: number = 7 * 24 * 60 * 60,
  ): Promise<void> {
    await this.client.set(
      `session:${sessionId}`,
      JSON.stringify(session),
      "EX",
      ttl,
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async deleteToken(token: string): Promise<void> {
    await this.client.del(`token:${token}`);
  }

  getClient(): RedisClient {
    return this.client;
  }
}

export const redis = new RedisService();
