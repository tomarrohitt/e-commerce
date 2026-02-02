-- CreateTable
CREATE TABLE "product_replicas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stockQuantity" INTEGER NOT NULL,
    "thumbnail" TEXT,
    "isActive" BOOLEAN NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_replicas_pkey" PRIMARY KEY ("id")
);
