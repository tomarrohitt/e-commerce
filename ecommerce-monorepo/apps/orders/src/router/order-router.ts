import { Router } from "express";
import { orderController } from "../controller/order-controller";

const orderRouter = Router();

orderRouter.post("/", orderController.createOrder);
orderRouter.get("/", orderController.getUserOrders);
orderRouter.get("/summary", orderController.getOrderSummary);
orderRouter.get("/total", orderController.getTotalSpend);
orderRouter.get("/:id", orderController.getOrder);
orderRouter.post("/:id/cancel", orderController.cancelOrder);
orderRouter.get("/:id/payment-status", orderController.getPaymentStatus);

export default orderRouter;
