import { Request, Response } from "express";
import {
  addImagesSchema,
  createProductSchema,
  listProductSchema,
  updateProductSchema,
  updateProductStockSchema,
  AddImagesInput,
  CreateProductInput,
  ListProductQuery,
  UpdateProductInput,
  UpdateProductStockInput,
} from "../lib/validation-schema";

import {
  deleteImages,
  generatePresignedUrls,
  StoragePrefix,
} from "@ecommerce/storage-service";

import productRepostiory from "../repository/product-repository";

import { BadRequestError, validateAndThrow } from "@ecommerce/common";

class ProductController {
  async createProduct(req: Request, res: Response) {
    const data = validateAndThrow<CreateProductInput>(
      createProductSchema,
      req.body,
    );
    const product = await productRepostiory.create(data);
    res.status(201).json({ success: true, data: product });
  }

  async getProduct(req: Request, res: Response) {
    const product = await productRepostiory.findbyId(req.params.id);
    res.status(200).json({ success: true, data: product });
  }

  async listProducts(req: Request, res: Response) {
    const filters = validateAndThrow<ListProductQuery>(
      listProductSchema,
      req.query,
    );
    const products = await productRepostiory.findMany(filters);

    res.status(200).json({ success: true, data: products });
  }

  async updateProduct(req: Request, res: Response) {
    const data = validateAndThrow<UpdateProductInput>(
      updateProductSchema,
      req.body,
    );

    const products = await productRepostiory.update(req.params.id, data);

    res.status(200).json({
      success: true,
      message: `Product with productID:${req.params.id} has been updated successfully`,
      data: products,
    });
  }

  async deleteProduct(req: Request, res: Response) {
    const product = await productRepostiory.findbyId(req.params.id);
    const { failed, deleted } = await deleteImages(product.images);
    await productRepostiory.delete(req.params.id);

    if (failed.length > 0) {
      return res.status(200).json({
        success: true,
        message: `Product deleted, but ${failed.length} images failed to delete and require manual cleanup.`,
        data: { failedImages: failed, deletedImagesCount: deleted.length },
      });
    }

    res.status(200).json({
      success: true,
      message: `Product with ProductID:${req.params.id} and all ${deleted.length} associated images have been deleted successfully.`,
    });
  }

  async updateStock(req: Request, res: Response) {
    const { stockQuantity: quantity } =
      validateAndThrow<UpdateProductStockInput>(
        updateProductStockSchema,
        req.body,
      );
    const { id } = req.params;

    if (quantity < 0) {
      const product = await productRepostiory.findbyId(req.params.id);

      if (product.stockQuantity + quantity < 0) {
        throw new BadRequestError("Insufficient stock for this operation.");
      }
    }

    const product = await productRepostiory.updateStock(id, quantity);

    res.status(200).json({
      success: true,
      message: `Product stock for ID:${req.params.id} has been updated successfully`,
      data: product,
    });
  }

  async getProductUploadUrls(req: Request, res: Response) {
    const { imageCount } = req.body;
    const { id } = req.params;

    if (!id || !imageCount) {
      throw new BadRequestError("Product ID and imageCount are required.");
    }

    if (imageCount < 3 || imageCount > 10) {
      throw new BadRequestError("Image count must be between 3 and 10.");
    }

    const result = await generatePresignedUrls(
      StoragePrefix.PRODUCT,
      id,
      imageCount,
    );

    res.status(200).json({ success: true, data: result });
  }

  async addImage(req: Request, res: Response) {
    const { images } = validateAndThrow<AddImagesInput>(
      addImagesSchema,
      req.body,
    );
    const id = req.params.id;

    const product = await productRepostiory.addImage(id, images);

    res.status(201).json({
      success: true,
      message: `Product images updated successfully`,
      data: product,
    });
  }
  async reorderImages(req: Request, res: Response) {
    const { images } = validateAndThrow<AddImagesInput>(
      addImagesSchema,
      req.body,
    );
    const { id } = req.params;

    const product = await productRepostiory.reorderImages(id, images);

    res.status(200).json({
      success: true,
      message: "Product images reordered successfully",
      data: product,
    });
  }
}

export default new ProductController();
