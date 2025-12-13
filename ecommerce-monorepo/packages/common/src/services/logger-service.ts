import winston from "winston";
import { env } from "../config/env";

const { combine, timestamp, printf, colorize, errors, json, splat } =
  winston.format;

// --- 1. Define the "Pretty" Format ---
// This is the Human-Readable layout
const devFormat = printf(
  ({ level, message, timestamp, stack, context, ...meta }) => {
    const contextTag = context ? `[${context}]` : "";

    // Clean up common meta fields we don't need to see in the console
    delete meta.service;
    delete meta.timestamp;

    // Format the stack trace if it exists
    const stackTrace = stack ? `\n\x1b[31m${stack}\x1b[0m` : ""; // Red color for stack

    // Format extra metadata (like IP, UserAgent) if present
    const metaString = Object.keys(meta).length
      ? `\n\x1b[90m${JSON.stringify(meta, null, 2)}\x1b[0m`
      : "";

    return `
${timestamp} ${level} ${contextTag}
${colorize().colorize(level === "error" ? "error" : "info", "Message:")} ${message}${stackTrace}${metaString}
  `.trim();
  }
);

// --- 2. Create the Logger ---
const baseLogger = winston.createLogger({
  // Default to 'debug' so you see everything
  level: "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    splat()
  ),
  transports: [
    new winston.transports.Console({
      // ⚠️ FORCE PRETTY PRINTING (Removed the NODE_ENV check for you)
      // If you deploy to prod later, change this back to: env.NODE_ENV === 'production' ? json() : ...
      format: combine(colorize(), devFormat),
    }),
  ],
});

// --- 3. ADAPTERS (Your existing setup) ---

export interface ILogger {
  info(message: string, ...meta: any[]): void;
  error(message: string, ...meta: any[]): void;
  warn(message: string, ...meta: any[]): void;
  debug(message: string, ...meta: any[]): void;
}

export class LoggerFactory {
  static create(context: string): winston.Logger {
    return baseLogger.child({ context });
  }
}

export class Logger implements ILogger {
  private internalLogger: winston.Logger;

  constructor(context: string) {
    this.internalLogger = baseLogger.child({ context });
  }

  info(message: string, ...meta: any[]) {
    this.internalLogger.info(message, ...meta);
  }

  error(message: string, ...meta: any[]) {
    this.internalLogger.error(message, ...meta);
  }

  warn(message: string, ...meta: any[]) {
    this.internalLogger.warn(message, ...meta);
  }

  debug(message: string, ...meta: any[]) {
    this.internalLogger.debug(message, ...meta);
  }
}

export const logger = baseLogger;
