// src/services/redis.service.ts

import Redis, { Redis as RedisClient, Pipeline } from "ioredis";
import { UserContext } from "../types/user-types";
import { REDIS_DEFAULTS } from "../constants";
import { ILogger, LoggerFactory } from "./logger-service";

export interface IRedisService {
  getSessionByToken(token: string): Promise<UserContext | null>;
  saveSessionDualLayer(
    token: string,
    session: UserContext,
    ttl?: number,
  ): Promise<void>;
  updateSessionData(
    sessionId: string,
    session: UserContext,
    ttl?: number,
  ): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deleteToken(token: string): Promise<void>;
  isConnected(): boolean;
  disconnect(): Promise<void>;
}

export interface RedisConfig {
  url: string;
  maxRetries?: number;
  retryDelay?: number;
  lazyConnect?: boolean;
}

export class RedisService implements IRedisService {
  private client: RedisClient;
  private connected = false;
  private readonly logger: ILogger;

  private readonly getSessionScript = `
    local tokenKey = KEYS[1]

    local pointerRaw = redis.call("GET", tokenKey)
    if not pointerRaw then
      return nil
    end

    local pointer = cjson.decode(pointerRaw)
    local sessionId = pointer.sessionId

    local session = redis.call("GET", "session:" .. sessionId)
    return session
  `;

  // Atomic dual-layer save with transaction
  private readonly saveSessionScript = `
    local tokenKey = KEYS[1]
    local sessionKey = KEYS[2]
    local pointerData = ARGV[1]
    local sessionData = ARGV[2]
    local ttl = tonumber(ARGV[3])

    redis.call("SET", tokenKey, pointerData, "EX", ttl)
    redis.call("SET", sessionKey, sessionData, "EX", ttl)

    return "OK"
  `;

  constructor(config: RedisConfig) {
    this.logger = LoggerFactory.create("RedisService");

    this.client = new Redis(config.url, {
      lazyConnect: config.lazyConnect ?? true,
      maxRetriesPerRequest: config.maxRetries ?? REDIS_DEFAULTS.MAX_RETRIES,
      retryStrategy: (times) => {
        const delay = Math.min(
          times * (config.retryDelay ?? REDIS_DEFAULTS.RETRY_DELAY),
          REDIS_DEFAULTS.MAX_RETRY_DELAY,
        );
        return delay;
      },
      enableReadyCheck: true,
      enableOfflineQueue: true,
    });

    this.setupEventHandlers();
    this.connect();
  }

  private setupEventHandlers(): void {
    this.client.on("connect", () => {
      this.connected = true;
    });

    this.client.on("ready", () => {
      this.connected = true;
    });

    this.client.on("error", (error) => {
      this.connected = false;
      this.logger.error("Redis connection error", error);
    });

    this.client.on("close", () => {
      this.connected = false;
      this.logger.warn("Redis connection closed");
    });

    this.client.on("reconnecting", () => {
      this.logger.info("Redis reconnecting...");
    });
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error("Failed to connect to Redis", error);
      throw error;
    }
  }

  async getSessionByToken(token: string): Promise<UserContext | null> {
    try {
      const result = await this.client.eval(
        this.getSessionScript,
        1,
        `token:${token}`,
      );

      if (!result) return null;

      return JSON.parse(result as string);
    } catch (error) {
      this.logger.error("Failed to get session by token", error, { token });
      return null;
    }
  }

  async saveSessionDualLayer(
    token: string,
    session: UserContext,
    ttl: number = REDIS_DEFAULTS.TTL.SESSION,
  ): Promise<void> {
    try {
      const tokenKey = `token:${token}`;
      const sessionKey = `session:${session.sessionId}`;
      const pointerData = JSON.stringify({ sessionId: session.sessionId });
      const sessionData = JSON.stringify(session);

      await this.client.eval(
        this.saveSessionScript,
        2,
        tokenKey,
        sessionKey,
        pointerData,
        sessionData,
        ttl.toString(),
      );
    } catch (error) {
      this.logger.error("Failed to save session", error, {
        sessionId: session.sessionId,
      });
      throw error;
    }
  }

  async updateSessionData(
    sessionId: string,
    session: UserContext,
    ttl: number = REDIS_DEFAULTS.TTL.SESSION,
  ): Promise<void> {
    try {
      await this.set(`session:${sessionId}`, session, ttl);
    } catch (error) {
      this.logger.error("Failed to update session", error, { sessionId });
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;

      try {
        return JSON.parse(data) as T;
      } catch {
        return data as unknown as T;
      }
    } catch (error) {
      this.logger.error("Failed to get key", error, { key });
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);

      if (ttl) {
        await this.client.set(key, stringValue, "EX", ttl);
      } else {
        await this.client.set(key, stringValue);
      }
    } catch (error) {
      this.logger.error("Failed to set key", error, { key, ttl });
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error("Failed to delete key", error, { key });
      throw error;
    }
  }

  async deleteToken(token: string): Promise<void> {
    await this.delete(`token:${token}`);
  }

  isConnected(): boolean {
    return this.connected;
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      this.logger.error("Error during Redis disconnect", error);
      throw error;
    }
  }

  getClient(): RedisClient {
    return this.client;
  }
}
