import { Request, Response, NextFunction } from "express";

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    let color = colors.green;
    if (status >= 500) {
      color = colors.red;
    } else if (status >= 400) {
      color = colors.yellow;
    }

    console.log(
      `${colors.cyan}[Gateway Request]${colors.reset} ` +
        `${req.method} ${req.url} ` +
        `${color}${status}${colors.reset} - ${duration}ms`
    );
  });

  next();
};
