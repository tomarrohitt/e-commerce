import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

// 1. Create a global variable to hold the instance in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 2. Define the setup function
const prismaClientSingleton = () => {
  // Create the pg pool
  const pool = new Pool({ connectionString });

  // Create the adapter
  const adapter = new PrismaPg(pool);

  // Pass the adapter to PrismaClient
  return new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"], // Helpful for debugging
  });
};

// 3. Export the client
export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
