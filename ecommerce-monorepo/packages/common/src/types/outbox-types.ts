export enum OutboxEventStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
}

export interface OutboxRecord {
  id: string;
  aggregateId: string;
  eventType: string;
  payload: any;
  status: any;
  createdAt: Date;
  updatedAt?: Date;
  retryCount?: number;
  lastError?: string;
}
export interface OutboxPrismaClient {
  outboxEvent: {
    findMany: (args: {
      where: { status?: any };
      take?: number;
      orderBy?: { createdAt: "asc" | "desc" };
    }) => Promise<OutboxRecord[]>;

    update: (args: {
      where: { id: string; status?: any };
      data: {
        status?: any;
        retryCount?: number;
        lastError?: string;
      };
    }) => Promise<OutboxRecord>;

    create: (args: {
      data: {
        aggregateId: string;
        eventType: string;
        payload: any;
        status?: any;
      };
    }) => Promise<OutboxRecord>;

    updateMany: (args: { where: any; data: any }) => Promise<{ count: number }>;
  };
}

export interface OutboxProcessorConfig {
  batchSize?: number;
  pollInterval?: number;
  lockTimeout?: number;
  maxRetries?: number;
}

export interface IOutboxProcessor {
  start(): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
}
