-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'PENDING', 'AWAITING_PAYMENT', 'PAID', 'FAILED', 'CANCELLED', 'SHIPPED', 'DELIVERED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "invoice_url" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'CREATED',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "payment_id" TEXT,
    "payment_client_secret" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "thumbnail" TEXT,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_addresses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone_number" TEXT,
    "orderShippingId" TEXT,
    "orderBillingId" TEXT,

    CONSTRAINT "order_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" TEXT NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),
    "retries" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_addresses_orderShippingId_key" ON "order_addresses"("orderShippingId");

-- CreateIndex
CREATE UNIQUE INDEX "order_addresses_orderBillingId_key" ON "order_addresses"("orderBillingId");

-- CreateIndex
CREATE INDEX "outbox_events_status_created_at_idx" ON "outbox_events"("status", "created_at");

-- CreateIndex
CREATE INDEX "outbox_events_aggregate_id_idx" ON "outbox_events"("aggregate_id");

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_addresses" ADD CONSTRAINT "order_addresses_orderShippingId_fkey" FOREIGN KEY ("orderShippingId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_addresses" ADD CONSTRAINT "order_addresses_orderBillingId_fkey" FOREIGN KEY ("orderBillingId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
