import { Router } from "express";
import { orderController } from "../controller/order-controller";
import express from "express";
import { orderService } from "../services/order-service";

const orderRouter = Router();

// User routes
orderRouter.post("/", orderController.createOrder);
orderRouter.get("/", orderController.getUserOrders);
orderRouter.get("/summary", orderController.getOrderSummary);
orderRouter.get("/:id", orderController.getOrder);
orderRouter.post("/:id/cancel", orderController.cancelOrder);
orderRouter.get("/:id/payment-status", orderController.getPaymentStatus);

export default orderRouter;
