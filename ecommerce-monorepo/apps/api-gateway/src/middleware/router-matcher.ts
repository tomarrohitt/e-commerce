import { Request } from "express";
import { RouteConfig, RouteRule } from "../config/routes";

export class RouteMatcher {
  static findConfig(path: string, configs: RouteConfig[]): RouteConfig | null {
    const sorted = [...configs].sort((a, b) => b.path.length - a.path.length);
    return sorted.find((config) => path.startsWith(config.path)) || null;
  }

  static findRule(req: Request, config: RouteConfig): RouteRule | null {
    const exactMatch = config.rules.find((r) => r.method === req.method);
    if (exactMatch) return exactMatch;

    const wildcardMatch = config.rules.find((r) => r.method === "ALL");
    if (wildcardMatch) return wildcardMatch;

    return null;
  }
}
