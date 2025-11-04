import { Request, Response } from "express";
import {
  addImagesSchema,
  createProductSchema,
  listProductSchema,
  updateProductQuantitySchema,
  updateProductSchema,
} from "../lib/product-validation-schema";

import productRepostiory from "../repository/product-repository";
import {
  deleteImages,
  generateMultipleUrls,
} from "../service/image-upload-service";

class ProductController {
  async createProduct(req: Request, res: Response) {
    try {
      const { error, value } = createProductSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }

      const product = await productRepostiory.create(value);

      res.status(201).json(product);
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async getProduct(req: Request, res: Response) {
    try {
      const product = await productRepostiory.findbyId(req.params.id);
      if (!product) {
        return res.status(400).json({ message: "Product not found" });
      }
      res.status(200).json(product);
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async listProducts(req: Request, res: Response) {
    try {
      const { error, value } = listProductSchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }
      const products = await productRepostiory.findMany(value);
      if (!products) {
        return res.status(400).json({ message: "Products not found" });
      }
      res.status(201).json(products);
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const { error, value } = updateProductSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }
      const products = await productRepostiory.update(req.params.id, value);
      res.status(201).json({
        message: `Product with productID:${req.params.id} has been updated successfully`,
        products,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }
  async deleteProduct(req: Request, res: Response) {
    try {
      const product = await productRepostiory.findbyId(req.params.id);

      if (!product) {
        return res.status(400).json("Product not found");
      }

      const { failed, deleted } = await deleteImages(product.images);
      if (failed.length > 0) {
        return res.status(200).json({
          message: `Product with ProductID:${req.params.id} has been deleted successfully, but ${failed.length} associated images failed to delete and require manual cleanup.`,
          failedImages: failed,
          deletedImagesCount: deleted.length,
        });
      }
      await productRepostiory.delete(req.params.id);
      return res.status(200).json({
        message: `Product with ProductID:${req.params.id} and all ${deleted.length} associated images have been deleted successfully.`,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async updateStock(req: Request, res: Response) {
    try {
      const {
        error,
        value: { stockQuantity: quantity },
      } = updateProductQuantitySchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }
      const { id } = req.params;

      if (quantity < 0) {
        const product = await productRepostiory.findbyId(req.params.id);

        if (!product) {
          return res.status(400).json("Product not found");
        }

        if (product?.stockQuantity + quantity < 0) {
          return res.status(404).json("Insufficient stock");
        }
      }

      const product = await productRepostiory.updateStock(id, quantity);
      res.status(201).json({
        message: `Product with productID:${req.params.id} has been updated successfully`,
        product,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async getProductUploadUrls(req: Request, res: Response) {
    const { imageCount } = req.body;
    const { id } = req.params;

    if (!id || !imageCount) {
      return res.status(400).json({
        error: "productId and imageCount are required",
      });
    }

    // Validate image count (3-10 images)
    if (imageCount < 3 || imageCount > 10) {
      return res.status(400).json({
        error: "Image count must be between 3 and 10",
      });
    }

    const result = await generateMultipleUrls(id, imageCount);
    res.status(200).json(result);
  }

  async addImage(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const {
        error,
        value: { images },
      } = addImagesSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }

      const product = await productRepostiory.addImage(id, images);
      res.status(201).json({
        message: `Product with productID:${req.params.id} has been updated successfully`,
        product,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error, message: "Internal server error" });
      }
    }
  }
}

export default new ProductController();
