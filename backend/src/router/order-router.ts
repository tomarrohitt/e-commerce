// router/order-router.ts
import { Router } from "express";
import orderController from "../controller/order-controller";
import { requireAdmin, requireAuth } from "../middleware/auth-middleware";
import express from "express";

const orderRouter = Router();

orderRouter.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }), // Raw body for signature verification
  orderController.handleStripeWebhook
);

// All routes require authentication
orderRouter.use(requireAuth);

// User routes
orderRouter.post("/", orderController.createOrder);
orderRouter.get("/", orderController.getUserOrders);
orderRouter.get("/summary", orderController.getOrderSummary);
orderRouter.get("/:id", orderController.getOrder);
orderRouter.post("/:id/cancel", orderController.cancelOrder);

orderRouter.use(requireAdmin);

// Admin routes
orderRouter.get("/admin/all", orderController.listAllOrdersAdmin);
orderRouter.post("/:id/status", orderController.updateOrderStatus);

orderRouter.post("/:id/refund", requireAdmin, orderController.refundOrder);

export default orderRouter;
