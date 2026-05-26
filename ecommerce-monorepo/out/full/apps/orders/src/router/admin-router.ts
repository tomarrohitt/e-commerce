import { Router } from "express";
import { adminController } from "../controller/admin-controller";

const adminRouter = Router();

adminRouter.get("/all", adminController.listAllOrdersAdmin);
adminRouter.patch("/:id/status", adminController.updateOrderStatus);
adminRouter.patch("/:id/cancel", adminController.cancelOrder);

adminRouter.post("/:id/refund", adminController.refundOrder);

export default adminRouter;
