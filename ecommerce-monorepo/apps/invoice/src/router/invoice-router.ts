import { Router } from "express";
import invoiceController from "../controller/invoice-controller";

const invoiceRouter = Router();

invoiceRouter.get("/:orderId", invoiceController.downloadInvoice);

export default invoiceRouter;
