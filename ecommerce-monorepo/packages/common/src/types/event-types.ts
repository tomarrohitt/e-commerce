// INFRASTRUCTURE & SHARED TYPES

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

export type DomainEvent = ProductEvent | UserEvent | OrderEvent;

// USER EVENTS (PUBLISHER: IDENTITY SERVICE)

export enum UserEventType {
  REGISTERED = "user.registered",
  VERIFIED = "user.verified",
  FORGOT_PASSWORD = "user.forgot_password",
}

export interface UserAuthLinkData {
  userId: string;
  email: string;
  name: string;
  link: string;
}

export interface UserRegisteredEvent extends Event<UserAuthLinkData> {
  eventType: UserEventType.REGISTERED;
}

export interface UserVerifiedData {
  userId: string;
  email: string;
  name: string;
}

export interface UserVerifiedEvent extends Event<UserVerifiedData> {
  eventType: UserEventType.VERIFIED;
}

export interface UserForgotPasswordEvent extends Event<UserAuthLinkData> {
  eventType: UserEventType.FORGOT_PASSWORD;
}

export type UserEvent =
  | UserRegisteredEvent
  | UserVerifiedEvent
  | UserForgotPasswordEvent;

// PRODUCT EVENTS (PUBLISHER: CATALOG SERVICE)

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
  categoryId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductUpdatedData extends ProductCreatedData {
  updatedAt: string;
}

export interface ProductDeletedData {
  id: string;
  deletedAt: string;
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

export interface ProductCreatedEvent extends Event<ProductCreatedData> {
  eventType: ProductEventType.CREATED;
}

export interface ProductUpdatedEvent extends Event<ProductUpdatedData> {
  eventType: ProductEventType.UPDATED;
}

export interface ProductDeletedEvent extends Event<ProductDeletedData> {
  eventType: ProductEventType.DELETED;
}

export interface StockChangedEvent extends Event<StockChangedData> {
  eventType: ProductEventType.STOCK_CHANGED;
}

export interface PriceChangedEvent extends Event<PriceChangedData> {
  eventType: ProductEventType.PRICE_CHANGED;
}

export type ProductEvent =
  | ProductCreatedEvent
  | ProductUpdatedEvent
  | ProductDeletedEvent
  | StockChangedEvent
  | PriceChangedEvent;

// ORDER EVENTS (PUBLISHER: ORDER SERVICE)

export enum OrderEventType {
  CREATED = "order.created",
  CONFIRMED = "order.confirmed",
  SHIPPED = "order.shipped",
  DELIVERED = "order.delivered",
  CANCELLED = "order.cancelled",
  PAYMENT_FAILED = "payment.failed",
}

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface AddressSnapshot {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderCreatedData {
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  totalAmount: number;
  status: string;
  items: OrderItemSnapshot[];
  shippingAddress: AddressSnapshot;
  createdAt: string;
}

export interface OrderCancelledData {
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  reason?: string;
}

export interface OrderCreatedEvent extends Event<OrderCreatedData> {
  eventType: OrderEventType.CREATED;
}

export interface OrderCancelledEvent extends Event<OrderCancelledData> {
  eventType: OrderEventType.CANCELLED;
}

export type OrderEvent = OrderCreatedEvent | OrderCancelledEvent;
