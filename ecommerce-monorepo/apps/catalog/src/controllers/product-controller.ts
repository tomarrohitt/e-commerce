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
import {
  BadRequestError,
  sendCreated,
  sendSuccess,
  validateAndThrow,
} from "@ecommerce/common";

class ProductController {
  async createProduct(req: Request, res: Response) {
    const data = validateAndThrow<CreateProductInput>(
      createProductSchema,
      req.body
    );
    const product = await productRepostiory.create(data);
    return sendCreated(res, product, "Product created successfully");
  }

  async getProduct(req: Request, res: Response) {
    const product = await productRepostiory.findbyId(req.params.id);
    return sendSuccess(res, product);
  }

  async listProducts(req: Request, res: Response) {
    const filters = validateAndThrow<ListProductQuery>(
      listProductSchema,
      req.query
    );
    const products = await productRepostiory.findMany(filters);
    return sendSuccess(res, products);
  }

  async updateProduct(req: Request, res: Response) {
    const data = validateAndThrow<UpdateProductInput>(
      updateProductSchema,
      req.body
    );
    const products = await productRepostiory.update(req.params.id, data);
    return sendSuccess(
      res,
      products,
      `Product with productID:${req.params.id} has been updated successfully`
    );
  }

  async deleteProduct(req: Request, res: Response) {
    const product = await productRepostiory.findbyId(req.params.id);
    const { failed, deleted } = await deleteImages(product.images);
    await productRepostiory.delete(req.params.id);

    if (failed.length > 0) {
      return sendSuccess(
        res,
        { failedImages: failed, deletedImagesCount: deleted.length },
        `Product deleted, but ${failed.length} images failed to delete.`,
        400
      );
    }

    return sendSuccess(
      res,
      null, // ✅ Pass null if no data is needed
      `Product with ProductID:${req.params.id} deleted successfully.`
    );
  }

  async updateStock(req: Request, res: Response) {
    const { stockQuantity: quantity } =
      validateAndThrow<UpdateProductStockInput>(
        updateProductStockSchema,
        req.body
      );
    const { id } = req.params;

    if (quantity < 0) {
      const product = await productRepostiory.findbyId(req.params.id);
      if (product.stockQuantity + quantity < 0) {
        throw new BadRequestError("Insufficient stock for this operation.");
      }
    }

    const product = await productRepostiory.updateStock(id, quantity);
    return sendSuccess(
      res,
      product,
      `Product stock for ID:${req.params.id} has been updated successfully`
    );
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
      imageCount
    );
    return sendSuccess(
      res,
      result,
      "Product upload URLs generated successfully"
    );
  }

  async addImage(req: Request, res: Response) {
    const { images } = validateAndThrow<AddImagesInput>(
      addImagesSchema,
      req.body
    );
    const id = req.params.id;
    const product = await productRepostiory.addImage(id, images);
    return sendSuccess(res, product);
  }

  async reorderImages(req: Request, res: Response) {
    const { images } = validateAndThrow<AddImagesInput>(
      addImagesSchema,
      req.body
    );
    const { id } = req.params;
    const product = await productRepostiory.reorderImages(id, images);
    return sendSuccess(res, product);
  }
}

export default new ProductController();
