import { Request, Response } from "express";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../lib/product-validation-schema";
import categoryRepository from "../repository/category-repository";

class CategoryController {
  async createCategory(req: Request, res: Response) {
    try {
      const { error, value } = createCategorySchema.validate(req.body, {
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

      const category = await categoryRepository.create(value);
      res
        .status(201)
        .json({ message: "Category created successfully", category });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async getCategoryById(req: Request, res: Response) {
    console.log({req: req.params})

    try {
      const category = await categoryRepository.findbyId(req.params.id);
      res.json({ category });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }
  async getCategoryBySlug(req: Request, res: Response) {
    console.log({req: req.params})
    try {
      const category = await categoryRepository.findBySlug(req.params.slug);
      res.json({ category });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async listCategories(req: Request, res: Response) {
    try {
      const categories = await categoryRepository.findMany();
      res.status(200).json({ categories });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const { error, value } = updateCategorySchema.validate(req.body, {
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
      const category = await categoryRepository.update(req.params.id, value);
      res.json(category);
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const category = await categoryRepository.delete(req.params.id);
      res.json({
        message: "Category with ID " + category.id + "deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error, message: "Internal server error" });
    }
  }
}

export default new CategoryController();
