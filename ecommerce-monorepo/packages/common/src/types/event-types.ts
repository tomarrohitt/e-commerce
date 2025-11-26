export interface Event<T = any> {
  eventId: string;
  eventType: string;
  timestamp: string;
  aggregateId?: string;
  version?: number;
  metadata?: Record<string, any>;
  data: T;
}

export interface EventBusConfig {
  serviceName?: string;
  url?: string;
  exchangeName?: string;
  dlqExchange?: string;
  dlqQueue?: string;
  prefetchCount?: number;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export enum ProductEventType {
  CREATED = "product.created",
  UPDATED = "product.updated",
  DELETED = "product.deleted",
  STOCK_CHANGED = "product.stock_changed",
  PRICE_CHANGED = "product.price_changed",
}

export interface ProductCreatedData {
  id: string;
  name: string;
  description?: string;
  price: string;
  stock: number;
  sku: string;
  images: string[];
  categoryId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ProductUpdatedData extends ProductCreatedData {
  updatedAt: Date;
}

export interface ProductDeletedData {
  id: string;
  deletedAt: Date;
}

export interface StockChangedData {
  id: string;
  stock: number;
  previousStock: number;
}

export interface PriceChangedData {
  id: string;
  price: string;
  previousPrice: string;
}

export enum OrderEventType {
  CREATED = "order.created",
  CONFIRMED = "order.confirmed",
  SHIPPED = "order.shipped",
  DELIVERED = "order.delivered",
  CANCELLED = "order.cancelled",
}
