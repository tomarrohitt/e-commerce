import { Request, Response } from "express";
import {
  CreateCategoryInput,
  createCategorySchema,
} from "../lib/validation-schema";
import categoryRepository from "../repository/category-repository";
import { generateSlug, validateAndThrow } from "@ecommerce/common";

class CategoryController {
  async createCategory(req: Request, res: Response) {
    const { name } = req.body;
    const slug = generateSlug(name);
    const data = validateAndThrow<CreateCategoryInput>(createCategorySchema, {
      name,
      slug,
    });

    const category = await categoryRepository.create(data);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  }
  async getCategoryById(req: Request, res: Response) {
    const category = await categoryRepository.findbyId(req.params.id);

    res.status(200).json({
      success: true,
      data: category,
    });
  }

  async listCategories(req: Request, res: Response) {
    const categories = await categoryRepository.findMany();

    res.status(200).json({
      success: true,
      data: categories,
    });
  }

  async updateCategory(req: Request, res: Response) {
    const { name } = req.body;
    const slug = generateSlug(name);
    const data = validateAndThrow<CreateCategoryInput>(createCategorySchema, {
      name,
      slug,
    });

    const category = await categoryRepository.update(req.params.id, data);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  }

  async deleteCategory(req: Request, res: Response) {
    const category = await categoryRepository.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  }
}

export default new CategoryController();
