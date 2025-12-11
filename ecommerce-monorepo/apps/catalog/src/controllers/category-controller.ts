import { Request, Response } from "express";
import {
  CreateCategoryInput,
  createCategorySchema,
} from "../lib/validation-schema";
import categoryRepository from "../repository/category-repository";
import {
  generateSlug,
  sendCreated,
  sendNoContent,
  sendSuccess,
  validateAndThrow,
} from "@ecommerce/common";

class CategoryController {
  async createCategory(req: Request, res: Response) {
    const { name } = req.body;
    const slug = generateSlug(name);
    const data = validateAndThrow<CreateCategoryInput>(createCategorySchema, {
      name,
      slug,
    });

    const category = await categoryRepository.create(data);
    return sendCreated(res, category, "Category created successfully");
  }
  async getCategoryById(req: Request, res: Response) {
    const category = await categoryRepository.findbyId(req.params.id);

    return sendSuccess(res, category);
  }

  async listCategories(req: Request, res: Response) {
    const categories = await categoryRepository.findMany();

    return sendSuccess(res, categories);
  }

  async updateCategory(req: Request, res: Response) {
    const { name } = req.body;
    const slug = generateSlug(name);
    const data = validateAndThrow<CreateCategoryInput>(createCategorySchema, {
      name,
      slug,
    });

    const category = await categoryRepository.update(req.params.id, data);

    return sendSuccess(res, category, "Category updated successfully");
  }

  async deleteCategory(req: Request, res: Response) {
    await categoryRepository.delete(req.params.id);

    return sendNoContent(res);
  }
}

export default new CategoryController();
