import { NotFoundError, safeQuery, sendError } from "@ecommerce/common";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { S3Service } from "../services/s3-service";

class InvoiceController {
  async downloadInvoice(req: Request, res: Response) {
    const { orderId } = req.params;

    const order = await safeQuery(
      () =>
        prisma.invoice.findFirst({
          where: {
            orderId,
          },
          select: {
            pdfUrl: true,
          },
        }),
      { model: "Invoice", operation: "update" }
    );

    if (!order) {
      return sendError(res, 404, "Invoice not found");
    }

    const urlObj = new URL(order.pdfUrl);

    const fileKey = urlObj.pathname.substring(1);
    const secureUrl = await S3Service.getSignedDownloadUrl(fileKey);

    res.json({ url: secureUrl });
  }
}

export default new InvoiceController();
