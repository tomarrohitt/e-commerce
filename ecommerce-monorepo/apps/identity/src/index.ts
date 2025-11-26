import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import auth from "./config/auth";
import userRouter from "./router/user-router";
import { errorHandler, currentUser } from "@ecommerce/common";
import { prisma } from "./config/prisma";
import internalRouter from "./router/internal-router";

const app = express();
const PORT = process.env.PORT || 4001;

app.all("/api/auth/*", toNodeHandler(auth));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(currentUser);

app.use("/api/internal", internalRouter);
app.use("/api/user", userRouter);

app.use(errorHandler);

async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Identity Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
const shutdown = async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startServer();
