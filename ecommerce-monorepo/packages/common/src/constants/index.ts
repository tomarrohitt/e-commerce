export const REDIS_DEFAULTS = {
  TTL: {
    SESSION: 7 * 24 * 60 * 60, // 7 days
    SHORT: 5 * 60, // 5 minutes
    MEDIUM: 30 * 60, // 30 minutes
    LONG: 24 * 60 * 60, // 24 hours
  },
  MAX_RETRIES: 3,
  RETRY_DELAY: 50,
  MAX_RETRY_DELAY: 2000,
} as const;

export const CIRCUIT_BREAKER_DEFAULTS = {
  FAILURE_THRESHOLD: 3,
  RESET_TIMEOUT: 10000,
  HALF_OPEN_REQUESTS: 1,
} as const;

export const EVENT_BUS_DEFAULTS = {
  EXCHANGE_NAME: "ecommerce.events",
  DLQ_EXCHANGE: "dlq.exchange",
  DLQ_QUEUE: "dlq.queue",
  PREFETCH_COUNT: 10,
  MAX_RECONNECT_ATTEMPTS: 10,
  RECONNECT_DELAY: 5000,
  DLQ_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  MAX_RETRIES: 3,
} as const;

export const OUTBOX_DEFAULTS = {
  BATCH_SIZE: 50,
  POLL_INTERVAL: 500,
  LOCK_TIMEOUT: 30000, // 30 seconds
} as const;

export const HTTP_DEFAULTS = {
  TIMEOUT: 5000,
  MAX_REDIRECTS: 5,
} as const;

export const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  name: "Name",
  sku: "SKU",
  slug: "Slug",
  token: "Token",
  categoryId: "Category",
  productId: "Product",
  userId: "User",
  orderId: "Order",
} as const;
