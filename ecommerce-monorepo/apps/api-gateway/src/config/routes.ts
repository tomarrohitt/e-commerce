import { env } from "./env";

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
    target: env.IDENTITY_SERVICE_URL,
    rules: [{ method: "ALL", protected: false }],
  },
  {
    path: "/api/auth/resend-verification-email",
    target: env.IDENTITY_SERVICE_URL,
    rules: [{ method: "POST", protected: false }],
  },
  {
    path: "/api/user",
    target: env.IDENTITY_SERVICE_URL,
    rules: [{ method: "ALL", protected: true }],
  },
  {
    path: "/api/addresses",
    target: env.IDENTITY_SERVICE_URL,
    rules: [{ method: "ALL", protected: true }],
  },
  {
    path: "/api/admin/user",
    target: env.IDENTITY_SERVICE_URL,
    rules: [{ method: "ALL", protected: true, adminOnly: true }],
  },
  {
    path: "/api/admin/addresses",
    target: env.IDENTITY_SERVICE_URL,
    rules: [{ method: "ALL", protected: true, adminOnly: true }],
  },
  {
    path: "/api/products",
    target: env.CATALOG_SERVICE_URL,
    rules: [
      { method: "GET", protected: false },
      { method: "POST", protected: true, adminOnly: true },
      { method: "PATCH", protected: true, adminOnly: true },
      { method: "DELETE", protected: true, adminOnly: true },
    ],
  },
  {
    path: "/api/category",
    target: env.CATALOG_SERVICE_URL,
    rules: [
      { method: "GET", protected: false },
      { method: "POST", protected: true, adminOnly: true },
      { method: "PATCH", protected: true, adminOnly: true },
      { method: "DELETE", protected: true, adminOnly: true },
    ],
  },
  {
    path: "/api/reviews",
    target: env.CATALOG_SERVICE_URL,
    rules: [
      { method: "GET", protected: false },
      { method: "POST", protected: true },
      { method: "PATCH", protected: true },
      { method: "DELETE", protected: true },
    ],
  },
  {
    path: "/api/reviews/status",
    target: env.CATALOG_SERVICE_URL,
    rules: [{ method: "GET", protected: true }],
  },
  {
    path: "/api/cart",
    target: env.CART_SERVICE_URL,
    rules: [{ method: "ALL", protected: true }],
  },
  {
    path: "/api/orders",
    target: env.ORDERS_SERVICE_URL,
    rules: [{ method: "ALL", protected: true }],
  },
  {
    path: "/api/admin/orders",
    target: env.ORDERS_SERVICE_URL,
    rules: [{ method: "ALL", protected: true, adminOnly: true }],
  },
  {
    path: "/api/orders/webhook",
    target: env.ORDERS_SERVICE_URL,
    rules: [{ method: "POST", protected: false }],
  },
  {
    path: "/api/invoice",
    target: env.INVOICE_SERVICE_URL,
    rules: [{ method: "ALL", protected: false }],
  },
];
