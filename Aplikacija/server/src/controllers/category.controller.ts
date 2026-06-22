import type { Request, Response } from "express";

import { treeifyError } from "zod";

import { ValidationError } from "../errors/index.js";
import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema.js";
import * as categoryService from "../services/category.service.js";
import { parseIdParam } from "../utils/parseIdParam.js";

export const getAll = async (req: Request, res: Response) => {
  const categories = await categoryService.findAll();
  res.json(categories);
};

export const getById = async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id, "category id");

  const category = await categoryService.findById(id);
  res.json(category);
};

export const createCategory = async (req: Request, res: Response) => {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  const category = await categoryService.createCategory(parsed.data);

  res.status(201).json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id, "category id");

  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(treeifyError(parsed.error));

  const updated = await categoryService.updateCategory(id, parsed.data);
  res.json(updated);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id, "category id");

  await categoryService.deleteCategory(id);
  res.status(204).send();
};
