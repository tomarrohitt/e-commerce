import winston from "winston";

const { combine, timestamp, printf, colorize, errors, splat } = winston.format;

const devFormat = printf(
  ({ level, message, timestamp, stack, context, ...meta }) => {
    const contextTag = context ? `[${context}]` : "";
    delete meta.service;
    delete meta.timestamp;

    const stackTrace = stack ? `\n\x1b[31m${stack}\x1b[0m` : "";

    const metaString = Object.keys(meta).length
      ? `\n\x1b[90m${JSON.stringify(meta, null, 2)}\x1b[0m`
      : "";

    return `
${timestamp} ${level} ${contextTag}
${colorize().colorize(level === "error" ? "error" : "info", "Message:")} ${message}${stackTrace}${metaString}
  `.trim();
  },
);

const baseLogger = winston.createLogger({
  level: "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    splat(),
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), devFormat),
    }),
  ],
});

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
