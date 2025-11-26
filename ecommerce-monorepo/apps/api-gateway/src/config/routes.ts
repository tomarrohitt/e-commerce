export interface RouteRule {
  method: string;
  protected: boolean;
  adminOnly?: boolean;
}

export interface RouteConfig {
  path: string;
  target: string;
  rules: RouteRule[];
}

export const routeConfigs: RouteConfig[] = [
  {
    path: "/api/auth",
    target: process.env.IDENTITY_SERVICE_URL!,
    rules: [{ method: "ALL", protected: false }],
  },
  {
    path: "/api/user",
    target: process.env.IDENTITY_SERVICE_URL!,
    rules: [{ method: "ALL", protected: true }],
  },
  {
    path: "/api/addresses",
    target: process.env.IDENTITY_SERVICE_URL!,
    rules: [{ method: "ALL", protected: true }],
  },
  {
    path: "/api/admin",
    target: process.env.IDENTITY_SERVICE_URL!,
    rules: [{ method: "ALL", protected: true, adminOnly: true }],
  },
  {
    path: "/api/products",
    target: process.env.CATALOG_SERVICE_URL!,
    rules: [
      { method: "GET", protected: false },
      { method: "POST", protected: true, adminOnly: true },
      { method: "PATCH", protected: true, adminOnly: true },
      { method: "DELETE", protected: true, adminOnly: true },
    ],
  },
  {
    path: "/api/category",
    target: process.env.CATALOG_SERVICE_URL!,
    rules: [
      { method: "GET", protected: false },
      { method: "POST", protected: true, adminOnly: true },
      { method: "PATCH", protected: true, adminOnly: true },
      { method: "DELETE", protected: true, adminOnly: true },
    ],
  },
  {
    path: "/api/cart",
    target: process.env.CART_SERVICE_URL!,
    rules: [{ method: "ALL", protected: true }],
  },
];
