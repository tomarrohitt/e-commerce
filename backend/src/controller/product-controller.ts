import { Request, Response } from "express";
import { ProductRepository } from "../repository/product-repository";
import {
  addImagesSchema,
  createProductSchema,
  listProductSchema,
  updateProductSchema,
} from "../lib/product-validation-schema";

class ProductController {
  private productRepostiory = new ProductRepository();
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
      const product = await this.productRepostiory.create(value);
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
      const product = await this.productRepostiory.findbyId(req.params.id);
      res.json(product);
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
      const products = await this.productRepostiory.findMany(value);
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
      const { error, value } = updateProductSchema.validate(req.query, {
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
      const products = await this.productRepostiory.findMany(value);
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
      await this.productRepostiory.delete(req.params.id);
      res.status(204).json({
        message: `Product with ProductID:${req.params.id} has been deleted successfully`,
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
      const { quantity } = req.body;
      const { id } = req.params;
      if (typeof quantity !== "number") {
        return res.status(400).json({ error: "Quantity must be a number" });
      }

      const product = await this.productRepostiory.updateStock(id, quantity);
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

  addImage = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { error, value: images } = addImagesSchema.validate(
        req.body.images,
        {
          abortEarly: false,
          stripUnknown: true,
        },
      );

      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => ({
            field: detail.path[0],
            message: detail.message,
          })),
        });
      }

      const product = await this.productRepostiory.addImage(id, images);
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
  };
}

export default new ProductController();
export const productController = new ProductController();
