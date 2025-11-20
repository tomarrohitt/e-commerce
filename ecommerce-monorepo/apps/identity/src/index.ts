import "express-async-errors";
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { errorHandler, NotFoundError } from "@ecommerce/common";

import { prisma } from "./config/prisma";
import auth from "./config/auth";
import internalRouter from "./router/internal-router";
import userRouter from "./router/user-router";

const app = express();
const PORT = process.env.PORT || 4001;
// 1. global middleware
app.use(helmet());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// 2. AUTH from better-auth (routes match /api/auth/*)
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. YOUR ROUTERS — must come BEFORE the catch-all
app.use("/api/auth/user", userRouter);
app.use("/api/auth/internal", internalRouter);

// 4. catch-all for all unmatched routes
app.all("*", (req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.url} not found`));
});

// 5. global error handler
app.use(errorHandler);

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to Identity Database (Postgres)");

    app.listen(PORT, () => {
      console.log(`Identity Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Identity server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
