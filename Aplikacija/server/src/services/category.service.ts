import type { CreateCategoryInput, UpdateCategoryInput } from "../schemas/category.schema.js";

import { BadRequestError } from "../errors/badRequestError.js";
import { NotFoundError } from "../errors/notFoundError.js";
import { prisma } from "../lib/prisma.js";
import { removeUndefined } from "../utils/removeUndefined.js";

export const findAll = async () => {
  return prisma.category.findMany({
    include: {
      _count: { select: { destinations: true } },
    },
  });
};

export const findById = async (id: number) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });
  if (!category) throw new NotFoundError();

  return category;
};

export const createCategory = async (data: CreateCategoryInput) => {
  return prisma.category.create({
    data: removeUndefined(data),
  });
};

export const updateCategory = async (id: number, data: UpdateCategoryInput) => {
  return prisma.category.update({
    where: { id },
    data: removeUndefined(data),
  });
};

export const deleteCategory = async (id: number) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { destinations: true } } },
  });
  if (!category) throw new NotFoundError();

  if (category._count.destinations > 0)
    throw new BadRequestError("Cannot delete a category that is used");

  return prisma.category.delete({ where: { id } });
};
