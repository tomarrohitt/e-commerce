import { NotFoundError } from "@ecommerce/common";
import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { S3Service } from "../services/s3-service";

class InvoiceController {
  async downloadInvoice(req: Request, res: Response) {
    const { orderId } = req.params;

    const order = await prisma.invoice.findFirst({
      where: {
        orderId,
      },
    });

    if (!order) {
      throw new NotFoundError();
    }

    const urlObj = new URL(order.pdfUrl);

    const fileKey = urlObj.pathname.substring(1);
    const secureUrl = await S3Service.getSignedDownloadUrl(fileKey);

    res.json({ url: secureUrl });
  }
}

export default new InvoiceController();
